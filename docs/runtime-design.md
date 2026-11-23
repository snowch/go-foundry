# Go runtime and prepared-image design

## Question and components

Can the standard Go compiler run inside browser Linux with usable startup, edited builds, tests, goroutines and file round-trips? This tests runtime feasibility, not learning effectiveness.

The page owns source drafts, instructions, observations, review marks and explicit transfer controls. One immutable HTTP/9P filesystem owns a minimal BusyBox/musl userspace, pinned Go SDK, prepared compiler cache and writable source baseline. Bellard's hosted service owns the external terminal, x86-64 emulator and kernel. The custom config supplies our root as fs0 and boots /sbin/go-foundry-init.

**Observed provider restriction:** the current hosted runtime asserts fs_count == 1. A proposed second filesystem failed in a real browser, despite generic TinyEMU documentation supporting more than one device. Therefore the prototype combines userspace and Go in one root; it does not mount an additional volume. Uploading and untarring the SDK in an existing guest was also too slow to be a suitable default.

This supplies preinstalled tools without forking or redistributing the emulator. Public TinyEMU MIT source documents RISC-V support; do not assume it supplies source or redistribution rights for every hosted x86-64 component. A fully self-hosted/offline runtime needs a separately licensed/open emulator and verification of its supported Go architecture.

## Image construction and execution

The builder verifies the official Go archive and Alpine minirootfs checksums. Only the BusyBox binary and musl loader are taken from Alpine. The image carries their licences and corresponding sources, including the exact Alpine BusyBox recipe, configuration and patches. These sources are also downloadable from the page. Go's SDK licence and patent grant remain in /opt/go.

Sorted file metadata, normalized timestamps and per-blob hashes produce a content-addressed image URL. The filesystem serializer implements TinyEMU's HTTP/9P format. Boot initializes proc/sys/dev and the terminal, sets the browser import directory to /root, and enters /root/work/go-foundry. No account, package download or SDK extraction is needed in the guest.

Native preparation uses the pinned SDK, amd64-v1, CGO disabled, trimpath and disabled VCS stamping. It compiles dependencies into /var/cache/go, but does not establish guest execution. Every ./run invokes the actual Go command; an edited greeting must rebuild and print its new text. Tests use -count=1, preventing cached native test results from replacing guest tests. Package downloads are disabled for this standard-library-only prototype.

Go cache index timestamps are normalized without changing content identifiers. The runner refreshes trim.txt so the disposable guest does not evict prepared entries because image metadata is old. New outputs and cache entries live in the guest's in-memory filesystem overlay and disappear when stopped. Guest-clock timings and maximum direct-child RSS are recorded separately from outside-the-VM waits; neither is total browser memory.

## Controls and saved work

Start is on demand. Reading the page does not boot Linux. The same iframe survives the four runtime-check views. Because the terminal is cross-origin, the page cannot inspect the prompt, execute commands, transfer edited files or save guest files automatically. The header truthfully reports Stopped or Session open. It must not report Ready merely because iframe loading finished. Reference output is labelled and never presented as the user's execution result.

The source editor saves drafts separately in browser storage. Download an edited file, upload it through the terminal and paste the generated apply command. Restore source provides undo. Storage failure keeps the draft in the current tab and advises downloading it.

Stop uses a modal warning and never claims to save guest files. Automatic stopping is disabled because it would discard unsaved work. Work archives include source, database files and measurements, excluding binaries and compiler caches. The export_file helper uses JSLinux's /.fscmd interface. In a fresh VM, upload and restore the archive over the clean baseline, then reopen the database in another process. Browser drafts and exported guest work are independent stores.

The record-store example is our bounded, single-writer Go implementation, not the third-party TinyDB package. It validates records and checksums before replacing snapshots. Reopening a snapshot and rejecting corruption do not prove power-loss durability or transactions.

## Publication and offline boundary

Fresh startup depends on external emulator/kernel files and our image files. Downloaded source or a work archive does not make Linux available offline. No full offline copy is offered.

A mature implementation should separate stable runtime images from frequently edited lesson sources, retain old immutable images for open guests and integrate a complete verified file set with the shared offline/update design. The prototype is not yet that course-wide updater. Export work before reloading or changing releases. Never reuse the same image URL for different file IDs.

CI generates large image files rather than committing them, verifies native Go tests, filesystem/source contracts and browser interface behavior. Interface tests deliberately stub the terminal; real hosted-emulator acceptance is a separate test and evidence record. Runtime-image cache keys include the builder, package pins, guest helpers, Go source and bundled documentation. Build failures must not publish a claim that the runtime was verified.

## Acceptance and interpretation

Exercise real guest boot; unchanged and edited source compilation; repeated builds; Go tests forced to execute; goroutines/channels; separate database writer and reader processes; archive export; a fresh guest; archive import; restored source recompilation and database reopen. Capture actual output, image identity and outside-the-VM waits. Distinguish prepared-cache results from empty-cache compilation and desktop-browser results from physical Android performance.

Inspect phone, tablet and wide layouts, light/dark themes, keyboard/modal controls and retained browser drafts. Passing functional tests demonstrates those tested behaviors; it does not establish learning effectiveness, native multicore speedup or physical crash durability.
