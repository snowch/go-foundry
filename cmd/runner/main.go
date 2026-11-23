// Command runner invokes the real Go toolchain; it never supplies example output.
package main

import (
	"context"
	"crypto/sha256"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"syscall"
	"time"
)

//go:embed main.go
var canonicalHelper []byte

var errOutputLimit = errors.New("output limit reached")

// os.File writes are immediate: a pipe reader such as head can buffer a short
// greeting until EOF, hiding progress and preventing timely cancellation.
type boundedOutput struct {
	mu        sync.Mutex
	target    io.Writer
	remaining int
	exceeded  bool
	cancel    context.CancelFunc
}

func (w *boundedOutput) Write(data []byte) (int, error) {
	w.mu.Lock()
	defer w.mu.Unlock()
	if len(data) > w.remaining {
		n, err := w.target.Write(data[:w.remaining])
		w.remaining -= n
		w.exceeded = true
		w.cancel()
		if err != nil {
			return n, err
		}
		return n, errOutputLimit
	}
	n, err := w.target.Write(data)
	w.remaining -= n
	return n, err
}

func execute(env []string, seconds int, program string, args ...string) (int, int64) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(seconds)*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, program, args...)
	cmd.Env, cmd.Stdin, cmd.Stdout, cmd.Stderr = env, os.Stdin, os.Stdout, os.Stderr
	var output *boundedOutput
	for _, value := range env {
		if strings.HasPrefix(value, "FOUNDRY_STATUS_FILE=") {
			output = &boundedOutput{target: os.Stdout, remaining: 2 * 1024 * 1024, cancel: cancel}
			cmd.Stdout, cmd.Stderr = output, output
			break
		}
	}
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error { return syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL) }
	err := cmd.Run()
	var rss int64
	if cmd.ProcessState != nil {
		rss = int64(cmd.ProcessState.SysUsage().(*syscall.Rusage).Maxrss)
	}
	if output != nil && output.exceeded {
		fmt.Fprintln(os.Stderr, "Output limit reached (2 MiB). The command was stopped.")
		return 125, rss
	}
	if ctx.Err() != nil {
		fmt.Fprintln(os.Stderr, "Command exceeded its time limit. Existing data is kept.")
		return 124, rss
	}
	if err != nil {
		if e, ok := err.(*exec.ExitError); ok {
			return e.ExitCode(), rss
		}
		fmt.Fprintln(os.Stderr, err)
		return 1, rss
	}
	return 0, rss
}
func phase(value string) {
	if path := os.Getenv("FOUNDRY_STATUS_FILE"); path != "" {
		_ = os.WriteFile(path, []byte(value), 0600)
	}
}

func main() {
	name := ""
	if len(os.Args) == 2 {
		name = os.Args[1]
	}
	mode, pkg, ok := resolveCommand(name)
	if !ok {
		fmt.Fprintln(os.Stderr, "Choose a lesson name, check:<lesson>, bench:<lesson>, hello, channels, test, db-insert or db-read.")
		os.Exit(2)
	}
	root, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	migrateLegacyHelper(root)

	sdk := os.Getenv("FOUNDRY_GO_SDK")
	if sdk == "" {
		sdk = "/opt/go"
	}
	cache := os.Getenv("FOUNDRY_GO_CACHE")
	if cache == "" {
		cache = "/var/cache/go"
	}
	if err = os.MkdirAll(cache, 0755); err != nil {
		panic(err)
	}
	// The image has normalized mtimes. Preserve prepared entries in this disposable VM.
	if err = os.WriteFile(filepath.Join(cache, "trim.txt"), []byte(fmt.Sprintf("%d\n", time.Now().Unix())), 0644); err != nil {
		panic(err)
	}
	for _, dir := range []string{".bin", "data"} {
		if err = os.MkdirAll(dir, 0755); err != nil {
			panic(err)
		}
	}
	env := append(os.Environ(), "GOROOT="+sdk, "GOCACHE="+cache, "GOPATH="+filepath.Join(root, ".go-path"), "GOTOOLCHAIN=local", "CGO_ENABLED=0", "GOAMD64=v1", "GOMAXPROCS=1", "GOGC=50", "GOPROXY=off", "GOSUMDB=off")
	started := time.Now()
	var buildTime, runTime time.Duration
	var code int
	var rss int64
	stage := "compiling"
	if name == "test" {
		stage = "testing"
		phase("testing")
		fmt.Println("Running Go tests...")
		code, rss = execute(env, 600, filepath.Join(sdk, "bin/go"), "test", "-p=1", "-buildvcs=false", "-trimpath", "-count=1", "-timeout=60s", "./...")
		buildTime = time.Since(started)
	} else {
		phase("compiling")
		fmt.Println("Building " + name + " with the Go compiler...")
		bin := strings.TrimPrefix(strings.TrimPrefix(name, "check:"), "bench:")
		if name == "db-insert" || name == "db-read" {
			bin = "tinydb"
		}
		output := filepath.Join(root, ".bin", bin)
		buildArgs := []string{"build", "-p=1", "-buildvcs=false", "-trimpath", "-o", output, pkg}
		if mode != "run" {
			buildArgs = []string{"test", "-c", "-p=1", "-buildvcs=false", "-trimpath", "-o", output, pkg}
		}
		code, rss = execute(env, 600, filepath.Join(sdk, "bin/go"), buildArgs...)
		buildTime = time.Since(started)
		if code == 0 {
			args := []string{}
			if name == "db-insert" {
				args = []string{"data/people.gdb", "insert", "7", "Ada", "42"}
			}
			if name == "db-read" {
				args = []string{"data/people.gdb", "get", "7"}
			}
			stage = "running"
			if mode != "run" {
				stage = "testing"
				args = []string{"-test.v", "-test.timeout=50s"}
			}
			if mode == "bench" {
				args = append(args, "-test.run=^$", "-test.bench=.", "-test.benchtime=1x", "-test.benchmem")
			}
			phase(stage)
			then := time.Now()
			var peak int64
			code, peak = execute(env, 60, output, args...)
			runTime = time.Since(then)
			if peak > rss {
				rss = peak
			}
		}
	}
	record := map[string]any{"case": name, "execution_stage": stage, "exit_code": code, "build_or_test_seconds": buildTime.Seconds(), "program_seconds": runTime.Seconds(), "total_seconds": time.Since(started).Seconds(), "max_child_process_rss_kib": rss, "utc": time.Now().UTC().Format(time.RFC3339)}
	data, _ := json.Marshal(record)
	if f, e := os.OpenFile("measurements.jsonl", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); e == nil {
		_, _ = f.Write(append(data, '\n'))
		_ = f.Close()
	} else {
		fmt.Fprintln(os.Stderr, "Could not save measurement:", e)
	}
	fmt.Println("Measurement:", string(data))
	os.Exit(code)
}

// A stock helper restored from a prior image may be upgraded. Never replace
// learner-customized bytes. The running image embeds its matching helper source.
func migrateLegacyHelper(root string) {
	path := filepath.Join(root, "cmd", "runner", "main.go")
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	digest := fmt.Sprintf("%x", sha256.Sum256(data))
	if digest != "88b1e043e3b1fa433ced4eeb7020c0556cd88bc544d8a770b71b2e53fb3e6e5b" && digest != "d658ded22b97a847a22efd49d07846f5f50815eb82cc928e0e914589f1f3f96a" {
		return
	}
	if err := os.WriteFile(path, canonicalHelper, 0644); err != nil {
		fmt.Fprintln(os.Stderr, "Could not update the original runner helper:", err)
	}
}

func resolveCommand(name string) (mode, pkg string, valid bool) {
	switch name {
	case "test":
		return "test", "", true
	case "db-insert", "db-read":
		return "run", "./cmd/tinydb", true
	}
	mode = "run"
	if strings.HasPrefix(name, "check:") {
		mode, name = "check", strings.TrimPrefix(name, "check:")
	}
	if strings.HasPrefix(name, "bench:") {
		mode, name = "bench", strings.TrimPrefix(name, "bench:")
	}
	if name == "runner" || !regexp.MustCompile(`^[a-z][a-z0-9-]*$`).MatchString(name) {
		return "", "", false
	}
	filename := "main.go"
	if mode != "run" {
		filename = "main_test.go"
	}
	if info, err := os.Stat(filepath.Join("cmd", name, filename)); err != nil || !info.Mode().IsRegular() {
		return "", "", false
	}
	return mode, "./cmd/" + name, true
}
