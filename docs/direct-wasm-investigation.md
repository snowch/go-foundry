# Direct WebAssembly Go compiler investigation

Rust Foundry runs its Rust compiler as WebAssembly, with a prepared standard library in memory. It compiles a single-file program to WASI and executes that program in another worker. Its prepared compiler module and library bytes are reused between lessons.

The first Go prototype instead runs Linux/amd64 Go tools inside JSLinux's x86-64 emulator. A prepared build cache saves dependency compilation, but each Go command still starts a driver process and performs filesystem work inside the emulated computer. The published first greeting build took about 440 seconds in one desktop investigation; an edited build took about 90 seconds. These observations are not controlled language-performance benchmarks.

| Approach | Compiler execution | Generated program | Current evidence |
| --- | --- | --- | --- |
| Rust Foundry | WebAssembly compiler, prepared sysroot | WASI | Implemented browser course |
| Go Linux prototype | Linux/x86-64 tools inside an emulator | Linux/x86-64 | Real browser compilation, Go tests, channels, records and file-transfer checks |
| Direct Go investigation | Go compiler and linker built for WASI | WASI | Small end-to-end probe in Node's WebAssembly engine; browser integration remains to be tested |

## What the direct probe established

The unmodified pinned Go 1.27.4 source can build its compiler and linker for `wasip1/wasm`:

```sh
GOOS=wasip1 GOARCH=wasm CGO_ENABLED=0 go build -trimpath -o compile.wasm cmd/compile
GOOS=wasip1 GOARCH=wasm CGO_ENABLED=0 go build -trimpath -o link.wasm cmd/link
```

Those tools ran through `@bjorn3/browser_wasi_shim` 0.3.0 in Node 24's WebAssembly engine. The source was:

```go
package main
func main() { println(42) }
```

The WebAssembly compiler produced a 1,992-byte Go object. The WebAssembly linker linked it with a native-prepared WASI runtime/sysroot into a 1,905,775-byte WASI program. Executing that program printed `42` and exited successfully. No x86 or Linux emulator executed these three stages. Native Go prepared the compiler/linker modules and target standard-library objects beforehand, as a build/publishing step.

Observed stage times, including module compilation/instantiation in that run, were approximately 1.65 seconds for compilation, 7.61 seconds for linking and 0.074 seconds for execution. Assets were already local. This is a feasibility probe, not a browser/mobile speed claim or a fair comparison against the network-loaded Linux prototype.

## What remains before using it for the course

Run the tools in real browser workers; test imported packages, multi-file builds, generics, goroutines/channels, real test harnesses, and the database's file operations. Build the package/import configuration in a reproducible way and check compilation diagnostics. The normal Go driver launches processes, which browser WASI does not supply; tool orchestration needs its own implementation and tests.

Verify the required WASI file operations, including rename, before promising database behavior. Test cancellation, memory limits, prepared-module reuse, saved learner work and worker cleanup on physical phones/tablets. Package and hash all compiler/sysroot assets under the shared offline/update mechanism. Preserve the Go and WASI shim licences.

The direct approach is the preferred next investigation for a responsive Go course. The Linux prototype demonstrates compatibility and exposes the costs of emulation; it should remain labelled as a runtime prototype until the chosen runner meets the course's performance and usability requirements.
