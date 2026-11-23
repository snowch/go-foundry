# Background jobs and saved project files

## Learner interface

Run captures the current editor bytes and selected lesson command. It starts the
runner on demand, restores the last committed project, applies that captured file,
and invokes the real Go compiler. The lesson shows starting, restoring, compiling,
running/testing, saving, and the final exit status. Combined stdout/stderr is shown
in Output; raw timing/RSS measurements are optional. An edited result is not judged
against the original example. Stop run cancels the job without discarding Linux.

The Linux iframe stays alive between lessons but is offscreen, inert, and outside
keyboard navigation until Open Linux terminal is selected. It is an optional
advanced tool, not a required step. Normal jobs have stdin closed; interactive
programs must be run from the terminal. A separate-tab terminal is a separate,
unsaved guest. Active terminal commands disable lesson submission and idle stop.

## Job bridge

The parent accepts messages only from its own same-origin guest frame. Jobs have
unique IDs. Source bytes and shell scripts travel through 9P files, not pasted
terminal text. Source destinations are bounded Go paths below the project root.
One job runs at a time; edits and lesson navigation cannot mutate a queued source
snapshot. Status, stdout/stderr and exit files are polled from the share. The Go
helper supplies explicit compile/run/test phases. Captured output is bounded by a 2 MiB pipe reader (not a process file-size
limit, which would also prevent the compiler from linking executables) and the UI retains at most 200,000 characters per result.
Transient share files are removed after snapshot acknowledgement.

Cancelling freezes the job shell, recursively freezes/kills its descendants, and
then checkpoints the project. Killing only the shell process group is insufficient:
the Go helper gives compiler/program children their own process groups. Existing
helper build/test and program time limits still apply. Browser termination or a
crashed guest can interrupt this process; there is no claim of crash-proof saving.

## Persistence and stopping

A checkpoint is a gzip tar archive of `/root/work/go-foundry`, including sources,
TinyDB data and measurements. Rebuildable binaries and project compiler caches
are excluded. The Go SDK, base Linux filesystem, process state, and files outside
the project are not persisted. A restart boots a clean prepared runtime and
restores the project archive before any queued editor file is applied.

After each job (including compiler errors and cancellation), the guest creates an
archive and transfers its bytes to the parent. IndexedDB database
`go-foundry-workspace-v1`, store `snapshots`, key `project` holds the last archive
and timestamp. A successful **transaction completion**, not a successful `put`
request alone, is acknowledged. The previous checkpoint remains intact if the
transaction aborts. A failed archive restoration never replaces that checkpoint
with the fresh baseline. Compressed automatic snapshots are limited to 32 MiB;
oversize/save failures leave the guest alive and require a manual archive export.

A Web Lock grants one active project runner per browser origin, preventing two
Go Foundry tabs from silently overwriting the same snapshot. A second tab can
still read/edit its own drafts; it must stop the first runner before starting.
Browsers without Web Locks cannot start this persistence-enabled runner safely.

The default idle interval is **30 minutes**. The learner can select 5, 15, 30 or
60 minutes, or Never, in Code runner. Run completion, terminal activity and timeout
changes reset the idle clock. Running jobs and terminal commands suspend idle
stopping. Manual stop and idle stop both checkpoint first and remove the guest
only after IndexedDB confirms success. If saving fails, the runner stays open and
the interface gives an export instruction. Background browser suspension can delay
the timer; it is rechecked when the page becomes visible.

Editor drafts, predictions, completion marks and last run results retain their
`go-foundry:v1:` local-storage keys, independently of the project archive. A draft
not yet run can therefore differ from the last executed source in the guest.
Download saved project gives an ordinary portable backup. Browser storage can be
cleared or evicted; automatic checkpoints are not permanent backups and cannot
save changes after an abrupt OS/browser kill. A before-unload warning remains for
an active guest. No complete offline runtime is offered yet: saved workspace data
alone does not eliminate the startup network requirement.

## Verification

`npm test` checks native starter/edited outputs and job error/source transport.
`npm run test:browser` uses a bridge stub to exercise state transitions, storage
failure, tab ownership, timing, keyboard interaction, and narrow/wide themes.
`npm run test:linux` boots the real VM with off-project requests blocked, compiles
all starters, edits and breaks Go source, cancels an infinite program, reruns in
that same guest, and reopens TinyDB after a checkpoint, full page reload and fresh
VM restoration. Its idle test advances only the parent's clock; guest archive
creation and IndexedDB writes remain real. See the CI run and validation record
for observed results. Functional success is not evidence of learning efficacy.
