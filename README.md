# Go Foundry runtime prototype

[Open the prototype](https://snowch.github.io/go-foundry/)

This prototype tests a standard Go toolchain inside browser Linux. It is a feasibility investigation, not the full Go Foundry course. Four checks cover compilation, Go tests, goroutines/channels, and saving and reopening a bounded TinyDB-style record store.

## Prepared toolchain image

A versioned, content-addressed HTTP/9P filesystem supplies Go 1.27.4, a prepared build cache and the source project. It mounts as an extra filesystem in Fabrice Bellard's hosted x86-64 JSLinux/Alpine guest. The user starts Linux and pastes one setup command; no SDK upload, extraction, learner account, or local Go installation is required.

The Go SDK is the unmodified official Linux/amd64 archive, verified against its pinned SHA-256 in `tools/go-toolchain.json`. `tools/build-image.py` produces the extra filesystem from that SDK, prepared cache entries and course-owned files. It does not copy or redistribute the emulator, kernel, or Linux base. The emulator and base filesystem remain external dependencies.

The cache improves preparation without substituting canned output. Every `./run` invokes the real Go command; edited source is rebuilt. `go test -count=1` forces tests to execute in the guest rather than reusing native test results. Compiler flags are `CGO_ENABLED=0`, `GOAMD64=v1`, `GOTOOLCHAIN=local`, `-trimpath` and `-buildvcs=false`. Guest package downloads are disabled; this prototype uses the standard library only.

## Run the four checks

1. Choose **Start Linux** and wait for the `localhost:~#` prompt. Ignore the optional account invitation.
2. Copy and paste **Prepare Go once per session** from the page. It mounts the prepared filesystem and copies only the small source project into the guest's working directory.
3. Run `./run hello`, `./run test`, and `./run channels`.
4. Run `./run db-insert` once, then `./run db-read` in a separate invocation.

The default program prints `Hello, Go!`. The channel program receives three results and prints sum 29. The record store inserts id 7, name Ada, score 42; a second process reads the saved row. Repeating the insert reports a duplicate and preserves the existing data.

The source editor saves browser drafts. To execute an edit, download the edited file, upload it through the terminal's upload control, then paste the generated apply command. Cross-origin isolation prevents the surrounding page from silently reading the terminal or transferring files into it.

## Save and resume

The terminal's guest files are temporary. Export a work archive before stopping, reloading or closing:

```sh
cd /root/work
tar czf /root/go-foundry-work.tar.gz --exclude='go-foundry/.bin' --exclude='go-foundry/.go-cache' --exclude='go-foundry/.go-path' go-foundry
export_file /root/go-foundry-work.tar.gz
```

In a fresh session, mount and prepare Go first, upload your backup using the terminal's upload control, then restore and read:

```sh
tar xzf /root/go-foundry-work.tar.gz -C /root/work
cd /root/work/go-foundry
./run db-read
```

Restoring the work archive intentionally replaces the fresh baseline project with your edits and data. The prepare script refuses to replace an existing project. Browser drafts, review marks and guest files are separate stores.

## Scope and limitations

The guest is configured with 768 MiB RAM; browser overhead and its emulated filesystem require additional memory. It needs internet access. This prototype does not claim a complete offline Linux installation. Automatic idle stopping is disabled because guest files are not saved automatically.

The record store is written in Go, independently of the third-party package named TinyDB. It validates ids, UTF-8 names, scores, sorted uniqueness, a generation and a SHA-256 checksum. It writes a temporary file and replaces the old snapshot only after validation and successful writing. It is a bounded, single-writer snapshot store, not a SQL engine, transaction manager or physical crash-durability proof.

Measurements from `run` use guest clocks and report maximum child-process RSS rather than total browser memory. Live acceptance records outside-the-VM wall-clock waits separately. Emulated concurrency does not establish native multicore speedup. Physical-device performance requires its own tests.

## Development

Use Node 24 and Python 3.12 or later. The image builder downloads and verifies the pinned Go SDK; no host Go install is required.

```sh
npm ci
python tools/build-image.py
npm run build
npm test
npm run test:browser
npm run serve
```

Native Go checks can use the downloaded SDK with a project-local build cache. `tests/live.cjs` verifies the published image in a real JSLinux guest; it is separate from interface tests and is not a stubbed compiler.

See [runtime/image design](docs/runtime-design.md), [verification record](docs/validation.json), [shared course style](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md) and [sources and licences](THIRD_PARTY.md).
