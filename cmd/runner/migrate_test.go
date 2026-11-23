package main

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
)

func TestLegacyHelperMigrationPreservesEdits(t *testing.T) {
	for _, fixture := range []string{"legacy_runner.go", "intro_runner.go"} {
		original, err := os.ReadFile(filepath.Join("testdata", fixture))
		if err != nil {
			t.Fatal(err)
		}
		for _, edited := range []bool{false, true} {
			root := t.TempDir()
			path := filepath.Join(root, "cmd", "runner", "main.go")
			if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
				t.Fatal(err)
			}
			input := original
			if edited {
				input = append(append([]byte{}, original...), []byte("\n// my edit\n")...)
			}
			if err := os.WriteFile(path, input, 0644); err != nil {
				t.Fatal(err)
			}
			migrateLegacyHelper(root)
			result, err := os.ReadFile(path)
			if err != nil {
				t.Fatal(err)
			}
			if edited && string(result) != string(input) {
				t.Fatal("learner edit changed")
			}
			if !edited && !bytes.Equal(result, canonicalHelper) {
				t.Fatal("stock helper did not migrate")
			}
		}
	}
}

func TestResolveLessonCommands(t *testing.T) {
	t.Chdir(t.TempDir())
	if err := os.MkdirAll("cmd/example", 0755); err != nil {
		t.Fatal(err)
	}
	for _, file := range []string{"main.go", "main_test.go"} {
		if err := os.WriteFile(filepath.Join("cmd/example", file), []byte("package main"), 0600); err != nil {
			t.Fatal(err)
		}
	}
	for _, input := range []string{"../example", "example;echo x", "check:../example", "bench:runner", "runner", "missing", "example/../../etc/passwd", ""} {
		if _, _, ok := resolveCommand(input); ok {
			t.Fatalf("accepted %q", input)
		}
	}
	for input, want := range map[string]string{"example": "run", "check:example": "check", "bench:example": "bench"} {
		mode, pkg, ok := resolveCommand(input)
		if !ok || mode != want || pkg != "./cmd/example" {
			t.Fatalf("%s: %s %s %v", input, mode, pkg, ok)
		}
	}
}
