# Go Foundry runtime prototype

This prototype uses a real Go 1.27.4 compiler inside a self-hosted Alpine Linux x86
guest running in v86. The terminal, emulator, BIOS, Linux kernel, Go SDK, prepared
cache, examples and fonts are published by this course. No runtime CDN or external
Linux service is required. It is still a runtime investigation, not a comprehensive
Go course or a performance-ready implementation.

Choose **Run edited source**. The page starts Linux if necessary, transfers the
current editor bytes through a guest-only file share and runs the selected check.
No command copy/paste or download/upload round trip is needed for editor changes.
The terminal upload control remains available for restoring work archives.

The guest uses 768 MiB RAM plus browser overhead. Export a work archive before
Stop Linux, reload or tab close. Browser drafts, observations and review marks keep
their existing `go-foundry:v1:` keys. Guest files remain temporary. There is no
verified offline-copy control yet; self-hosting alone is not an offline guarantee.

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

[Runtime design](docs/self-hosted-linux.md), [licences](THIRD_PARTY.md) and the
[direct Go WebAssembly investigation](docs/direct-wasm-investigation.md) explain
the implementation and its limits. The legacy JSLinux serializer is retained for
compatibility/source history, not used to start new sessions.
