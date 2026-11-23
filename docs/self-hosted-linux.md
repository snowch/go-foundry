# Self-hosted browser Linux migration

The replacement uses the BSD-2-Clause v86 emulator, local SeaBIOS/SeaVGABIOS and
an Alpine Linux x86 guest. Do not mirror Bellard's current x86 JSLinux binaries:
the public TinyEMU source covers its RISC-V implementation, and does not establish
redistribution rights for the current hosted x86 runtime.

The guest and all files load from the individual lab's project scope. An explicit
file-share bridge transfers the current editor bytes to Linux; the UI never relies
on a manually pasted filename or injects large source strings through the terminal.
Preserve browser drafts. The current Go adapter checkpoints project files to
IndexedDB before teardown; see [background jobs and persistence](background-runner.md).
Files outside that project directory still require a manual export.

Source packages, exact upstream recipes, licence notices and checksums travel with
the release. A host build tool download is not a learner runtime dependency. A
complete offline claim requires every emulator, BIOS, kernel and guest chunk in
the verified release, followed by a real fresh offline startup and edited run.

## Go adapter

The UI receives a ready acknowledgement only after the guest mounts its file
share and opens the prepared shell. Source transfer uses the complete editor
bytes and an allowlisted workspace path. The guest shell runs the real Go
compiler; original-example output is never substituted for actual execution.
Queued startup captures the requested source snapshot. Theme/navigation changes
retain the same guest iframe. Stop checkpoints the project before releasing Linux, and reload retains a warning
for an active guest. Browser drafts are independent of the saved guest project.

Runtime image and frontend retention are separate. Publication must restore the
previous image cache when migrating from JSLinux and retain its immutable
`runtime/images/` files for already-open legacy guests. No new session uses the
legacy provider.

The guest is now x86/386. On a restored archive, the compiled helper migrates
only the exact original amd64 runner source to cast `Rusage.Maxrss` portably.
Custom helper edits and learner program sources are retained unchanged. Native
regression tests verify both cases; private migration fixtures are not course
examples. Go rebuilds restored program binaries for the current guest.
