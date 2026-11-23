# Historical investigation: Go runtime and prepared-image design

> This document records the original external JSLinux investigation. It is not the
> current implementation. See [self-hosted Linux](self-hosted-linux.md) and
> [background jobs and persistence](background-runner.md) for the current design.

## Question and components

Can the standard Go compiler run inside browser Linux with usable startup, edited builds, tests, goroutines and file round-trips? This tests runtime feasibility, not learning effectiveness.

The page owns source drafts, instructions, observations, review marks and explicit transfer controls. One immutable HTTP/9P filesystem owns a minimal BusyBox/musl userspace, pinned Go SDK, prepared compiler cache and writable source baseline. Bellard's hosted service owns the external terminal, x86-64 emulator and kernel. The custom config supplies our root as fs0 and boots /sbin/go-foundry-init.

**Observed provider restriction:** the current hosted runtime asserts fs_count == 1. A proposed second filesystem failed in a real browser, despite generic TinyEMU documentation supporting more than one device. Therefore the prototype combines userspace and Go in one root; it does not mount an additional volume. Uploading and untarring the SDK in an existing guest was also too slow to be a suitable default.

This supplies preinstalled tools without forking or redistributing the emulator. Public TinyEMU MIT source documents RISC-V support; do not assume it supplies source or redistribution rights for every hosted x86-64 component. A fully self-hosted/offline runtime needs a separately licensed/open emulator and verification of its supported Go architecture.

## Image construction and execution

The builder verifies the official Go archive and Alpine minirootfs checksums. Only the BusyBox binary and musl loader are taken from Alpine. The image carries their licences and corresponding sources, including the exact Alpine BusyBox recipe, configuration and patches. These sources are also downloadable from the page. Go's SDK licence and patent grant remain in /opt/go.

Sorted file metadata, normalized timestamps and per-blob hashes produce a content-addressed image URL. The filesystem serializer implements TinyEMU's HTTP/9P format. Boot initializes proc/sys/dev, a 384 MiB maximum tmpfs at /tmp and the terminal, sets the browser import directory to /root, and enters /root/work/go-foundry. No account, package download or SDK extraction is needed in the guest. The Go linker requires a writable mmap for temporary output, which the provider’s shared 9P filesystem rejects. Builds therefore use tmpfs rather than /tmp on 9P; this limit is not a missing Go compiler. tmpfs grows as used within the guest RAM budget.

Native preparation uses the pinned SDK, amd64-v1, CGO disabled, trimpath and disabled VCS stamping. It compiles dependencies into /var/cache/go, but does not establish guest execution. Every ./run invokes the actual Go command; an edited greeting must rebuild and print its new text. Tests use -count=1, preventing cached native test results from replacing guest tests. Package downloads are disabled for this standard-library-only prototype.

Go cache index timestamps are normalized without changing content identifiers. The runner refreshes trim.txt so the disposable guest does not evict prepared entries because image metadata is old. New outputs and cache entries live in the guest's in-memory filesystem overlay and disappear when stopped. Guest-clock timings and maximum direct-child RSS are recorded separately from outside-the-VM waits; neither is total browser memory.

## Controls and saved work

Start is on demand. Reading the page does not boot Linux. The same iframe survives the four runtime-check views. Because the terminal is cross-origin, the page cannot inspect the prompt, execute commands, transfer edited files or save guest files automatically. The header truthfully reports Stopped or Session open. It must not report Ready merely because iframe loading finished. Reference output is labelled and never presented as the user's execution result.

The source editor saves drafts separately in browser storage. Its three visible transfer steps are Download edited file, upload it using Choose files below the black console, and copy/paste the run command. Name the destination Go file. The short command finds an uploaded .go file whose SHA-256 matches the current editor, stages its contents beside the destination and replaces the destination before running the check. Missing or outdated uploads produce a concrete upload instruction and leave the existing source intact. Browser-added filename suffixes are accepted because matching uses file contents.

The earlier upload prerequisite was easy to miss; learners could paste an apply command without a file and receive only a cp error. Keep the download control visible with the instructions. A source-carrying base64/heredoc alternative passed local shell tests, but the real hosted terminal truncated the long paste and left the shell awaiting input. Do not use that approach with this service. Transport tests must use the real terminal rather than infer its capacity from a native shell or an interface stub.

Restore source provides undo. Storage failure keeps a draft in the current tab and advises downloading it. Guest work and browser drafts remain separate stores. Keep Stop beside the terminal. Real embedded-terminal scrolling/focus interactions needed additional verification after export; the stub alone did not cover this path. Assert modal visibility and restore the exported archive into a fresh VM.

Stop uses a modal warning and never claims to save guest files. Automatic stopping is disabled because it would discard unsaved work. Work archives include source, database files and measurements, excluding binaries and compiler caches. The export_file helper uses JSLinux's /.fscmd interface. In a fresh VM, upload and restore the archive over the clean baseline, then reopen the database in another process. Browser drafts and exported guest work are independent stores.

The record-store example is our bounded, single-writer Go implementation, not the third-party TinyDB package. It validates records and checksums before replacing snapshots. Reopening a snapshot and rejecting corruption do not prove power-loss durability or transactions.

## Publication and offline boundary

Fresh startup depends on external emulator/kernel files and our image files. Downloaded source or a work archive does not make Linux available offline. No full offline copy is offered.

A mature implementation should separate stable runtime images from frequently edited lesson sources, retain old immutable images for open guests and integrate a complete verified file set with the shared offline/update design. The prototype is not yet that course-wide updater. Export work before reloading or changing releases. Never reuse the same image URL for different file IDs.

CI generates large image files rather than committing them, verifies native Go tests, filesystem/source contracts and browser interface behavior. Interface tests deliberately stub the terminal; real hosted-emulator acceptance is a separate test and evidence record. Runtime-image cache keys include the builder, package pins, guest helpers, Go source and bundled documentation. Build failures must not publish a claim that the runtime was verified.

## Acceptance and interpretation

Exercise real guest boot; unchanged and edited source compilation; repeated builds; Go tests forced to execute; goroutines/channels; separate database writer and reader processes; archive export; a fresh guest; archive import; restored source recompilation and database reopen. Capture actual output, image identity and outside-the-VM waits. Distinguish prepared-cache results from empty-cache compilation and desktop-browser results from physical Android performance.

Inspect phone, tablet and wide layouts, light/dark themes, keyboard/modal controls and retained browser drafts. Passing functional tests demonstrates those tested behaviors; it does not establish learning effectiveness, native multicore speedup or physical crash durability.

## Performance direction

See [the direct WebAssembly investigation](direct-wasm-investigation.md). Rust Foundry avoids the x86 emulation layer and reuses its prepared compiler/sysroot. A small standard-Go compiler/linker WASI probe also works in Node’s WebAssembly engine, but browser integration, package/test orchestration and database operations remain unverified for that route. The current Linux prototype is not a performance-ready full course.

## Frontend publishing

Build scripts and styles under content-hashed names, including the source-transfer module import. Preserve the original unversioned app/style aliases for cached pre-versioning HTML. The publisher verifies those aliases on first adoption and then retains two previous small frontend graphs, checking their hashes before publication. The interface test also loads the original HTML against these aliases. A failed compatibility check blocks publishing.

This frontend change reuses the existing runtime image; confirm its identity in CI before merging so open guests keep their filesystem URLs. Runtime-image retention across an actual SDK/image replacement remains a separate production requirement. Do not infer it from small frontend retention or the prototype's build cache.
