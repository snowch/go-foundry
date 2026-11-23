# Go Foundry runtime prototype

[Open the prototype](https://snowch.github.io/go-foundry/)

A feasibility investigation for Go Foundry, before building the full course. Four checks cover actual compilation, Go tests, goroutines/channels and saving and reopening a bounded TinyDB-style record store.

## Prepared Linux image

One versioned, content-addressed HTTP/9P root filesystem supplies a minimal BusyBox/musl Linux userspace, Go 1.27.4, a prepared build cache and the source project. Fabrice Bellard's externally hosted x86-64 JSLinux emulator and kernel boot it directly. Start Linux and wait for the prepared workspace prompt; no SDK upload, extraction, account or local Go installation is required.

The official Linux/amd64 SDK is checked against the SHA-256 in `tools/go-toolchain.json`. The OS binaries and their corresponding source are pinned in `tools/guest-packages.json`. The image includes Go licences and the BusyBox source, exact Alpine build recipe/config/patches, GPL licence and musl source/copyright. The emulator and kernel are not redistributed.

Every `./run` invokes the real Go command. Edited source is rebuilt; `go test -count=1` forces tests to execute in the guest. The cache speeds up dependency compilation without substituting example output. Settings are `CGO_ENABLED=0`, `GOAMD64=v1`, `GOTOOLCHAIN=local`, `-trimpath` and `-buildvcs=false`. Package downloads are disabled; the prototype uses the standard library only.

## Run the checks

1. Choose **Start Linux**. Wait for **Go workspace prepared** and the `go-foundry:~#` prompt.
2. Run `./run hello`, `./run test` and `./run channels` in the Linux terminal.
3. Run `./run db-insert` once, then `./run db-read` in a separate invocation.

The greeting prints `Hello, Go!`. The channel program receives three results and prints sum 29. The store inserts id 7, name Ada, score 42; a second process reads that row. Repeating the insert reports a duplicate and preserves existing data.

The page's source editor saves browser drafts. To execute an edit, download the edited file, upload it through the terminal's upload control, then paste the generated apply command. The cross-origin page cannot silently inspect the terminal or transfer files into it.

## Save and resume

Guest files are temporary. Export a work archive before stopping, reloading or closing:

```sh
cd /root/work
tar czf /root/go-foundry-work.tar.gz --exclude='go-foundry/.bin' --exclude='go-foundry/.go-cache' --exclude='go-foundry/.go-path' go-foundry
export_file /root/go-foundry-work.tar.gz
```

Start a fresh session, wait for the prompt, upload your backup using the terminal's upload control, then restore and read:

```sh
tar xzf /root/go-foundry-work.tar.gz -C /root/work
cd /root/work/go-foundry
./run db-read
```

Restore replaces the fresh baseline project with your edits and data. Export an existing guest's work before replacing its project. Browser drafts, review marks and guest files are separate stores.

## Limits

The guest has 768 MiB configured RAM; the browser and emulated filesystem require additional memory. Fresh startup needs internet access. There is no complete offline Linux guarantee. Automatic stopping is disabled because guest files are not saved automatically.

The Go store is independent of the third-party package named TinyDB. It validates ids, UTF-8 names, scores, sorted uniqueness, a generation and a SHA-256 checksum. It validates and writes a temporary file before replacing the snapshot. It is a bounded single-writer store, not a SQL engine or proof of physical crash durability.

Runner measurements use guest clocks and maximum child-process RSS, not total browser memory. Live acceptance records outside-the-VM waits separately. Emulated concurrency does not establish native multicore speedup. Physical Android performance requires separate tests.

## Development

Use Node 24 and Python 3.12 or later. The builder downloads and verifies the Go SDK and minimal OS packages.

```sh
npm ci
python tools/build-image.py
npm run build
npm test
npm run test:browser
npm run serve
```

`tests/live.cjs` exercises the real external emulator and Go compiler. It is separate from interface-only tests, which stub the terminal. See [runtime design](docs/runtime-design.md), [verification record](docs/validation.json), [shared course style](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md) and [sources and licences](THIRD_PARTY.md).
