# Go runtime and prepared-image design

## Prototype question

Can a normal Go compiler run inside a browser-hosted Linux VM, with sufficiently usable preparation, edited builds, tests, concurrency and file round-trips? This is a tools/experience feasibility question, not evidence that a full course improves learning.

The small Go project provides a greeting, a channel/WaitGroup example, executable Go tests, and a bounded checksummed record store. The record store validates before replacing a file, rejects duplicates and corruption, and reopens in a separate process. It is not a SQL engine or a physical durability claim.

## Three separate components

1. The course page owns instructions, source drafts, observations, review marks, commands, source archives and validation evidence.
2. A content-addressed toolchain filesystem owns the pinned Go SDK, prepared Go build cache and source project. The HTTP/9P format is compatible with TinyEMU's file server. The builder sorts entries, normalizes metadata/cache-index timestamps and hashes every published blob. Its immutable URL is recorded in linux.cfg.
3. The existing hosted JSLinux service owns the x86-64 emulator, kernel and Alpine base. The custom config mounts the course filesystem as an additional guest volume. Nothing from that service is redistributed by this prototype.

This implements a preinstalled-tools image layer without forking the emulator. A future image can supply the same tools to another compatible emulator. The publicly documented TinyEMU source covers RISC-V and is MIT licensed; do not assume that its licence automatically supplies the source or redistribution rights for every current hosted x86-64 binary. A fully self-hosted runtime would verify that component's rights or use an open emulator, build its own Linux base and validate the chosen Go architecture.

## Setup and compilation

Start is on demand. Opening the course does not boot Linux or fetch the SDK filesystem. The user waits for a terminal prompt, mounts the extra volume, then runs its prepare script. Only the small source project is copied; the SDK and cache remain on the mounted filesystem. Preparation refuses to overwrite an existing work directory.

The SDK is the unmodified official Go 1.27.4 Linux/amd64 archive with its published SHA-256 recorded locally. SDK licences remain inside the filesystem. Host-side prewarming uses that exact SDK, pure-Go amd64-v1 settings, trimpath and disabled VCS stamping. It compiles the example/test dependencies without asserting guest execution. The actual Go command checks source on every run. Edited source must demonstrably rebuild in the VM. Tests always use -count=1, so native test results cannot substitute for guest execution.

Go's cache action-index timestamps are normalized for a reproducible image; content identifiers are unchanged. The short-lived guest updates trim.txt before each command so unused prepared entries are not deleted merely because the image has old metadata. New cache data lives in the guest overlay. Stop discards it.

The initial alternative of uploading and unpacking a complete SDK is retained as an optional reproducibility path, not the normal user flow. It has significant preparation cost in an emulator. A guest download via its restricted VPN is particularly unsuitable for the SDK; the custom filesystem uses browser HTTP requests instead.

## Truthful controls and saved work

The hosted iframe has another origin. The surrounding page cannot truthfully report its boot/Go readiness, transfer source automatically, run commands or save guest files. Status therefore says Stopped or Session open, with explicit instructions to inspect the terminal. Copy command is separate from execution. The displayed reference output is labelled as reference, never a simulated Console.

The same iframe survives check navigation. Stop uses a modal and warns about guest files. Automatic idle stopping is disabled: killing the VM after an arbitrary period would lose unsaved guest work. Browser editor drafts are saved independently and have undo after source restoration. Failed storage keeps a draft in the tab and offers download.

Work export includes source, data, helper configuration and measurements. It excludes build binaries and large compiler caches. The SDK mount is prepared again in a fresh session, then the exported work is restored over the fresh baseline. This is an explicit backup/restore operation, not an automatic running-machine snapshot.

## Offline and publishing boundaries

The current runtime depends on external emulator/kernel/base files. A source archive or the course page's downloaded files do not make a fresh Linux VM available offline. The interface must not claim a complete offline installation. Full offline operation requires a self-hosted, licensed emulator and a complete verified image/file set, integrated with the shared offline/update design.

Keep immutable toolchain images available for old open guests when publishing a replacement. A full course should split stable SDK/cache images from small course-source versions and retain them independently. Do not reuse an image URL for different file IDs: an open guest can otherwise fetch unrelated bytes after publication.

The prototype builds its image without committing large generated files to Git. CI caches the SDK/image, runs the reference Go tests, validates filesystem/source contracts and runs interface checks. Live hosted-guest acceptance is separate and records actual terminal output and outside-the-VM elapsed waits. Provider availability is not faked by a terminal stub.

## Acceptance

Verify a real guest boot and toolchain mount; unchanged and edited greeting builds; Go tests forced to run in the guest; actual goroutine/channel results; separate database writer/reader processes; saved source and data restored in a new VM; and honest failure handling. Record cold-empty-cache versus prepared-cache assumptions. Report guest RAM and child-process RSS separately from browser memory, and emulated elapsed times separately from native performance. Inspect phone, tablet, wide, light/dark and keyboard interactions.
