# Go Foundry

The first three chapters teach first programs, values and types, and conditions
and loops through nine editable lessons. No Go installation, account or shell
commands are required. **Run** starts a self-hosted Linux guest, compiles the
current editor source with real Go 1.27.4, and shows actual output or compiler
errors in the lesson. **Stop run** cancels a program without discarding Linux.
The terminal remains an optional advanced tool.

Project files and TinyDB data are saved to IndexedDB after each run and before
stopping. A fresh runtime restores that project automatically. The default idle
stop is 30 minutes, configurable in Code runner. If saving fails, the guest stays
running. Browser editor drafts, observations and completion marks keep their
existing `go-foundry:v1:` keys. Download a project archive for a permanent backup;
browser storage may be cleared or evicted.

The guest uses 768 MiB RAM plus browser overhead. Its emulator, terminal, BIOS,
kernel, Go SDK, prepared cache and examples are self-hosted. A fresh startup still
needs internet: there is no verified complete offline-copy control yet. This is
an introductory course with a prototype runtime, not a complete Go curriculum or
a native-speed performance environment.

## Build and verification

Run `npm ci`, `npm run build`, `npm test` and `npm run test:browser`.
The build downloads checksum-pinned dependencies once into `.cache/`, assembles a
local guest image and splits it into static-host-friendly chunks. A Linux x86-64
host with Python, liblz4 and Node 24 is required. CI can execute the 386 Go tools
natively; hosts without that support use a pinned build-only QEMU fallback.

`docs/validation.json` records real self-hosted browser execution. The initial
investigation passed the greeting, channels, Go tests and separate database
writer/reader processes with requests outside the lab blocked. Go tests were slow:
about 512 seconds including compilation with that initial cache. Passing those
checks does not establish mobile performance or learning effectiveness.

[Background jobs and persistence](docs/background-runner.md),
[first-chapter learning design](docs/learning-design.md),
[self-hosted runtime design](docs/self-hosted-linux.md), [licences](THIRD_PARTY.md) and the
[direct Go WebAssembly investigation](docs/direct-wasm-investigation.md) explain
the implementation and its limits. The legacy JSLinux serializer is retained for
compatibility/source history, not used to start new sessions.
