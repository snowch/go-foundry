# First chapters and runner review

The learner route assumes no Go or terminal experience. It has one primary Run
button, line-numbered editable source, visible definitions/actions/results, and
optional original-output comparisons. Compiler errors replace prior output and
remain distinct from startup and browser-storage failures. A valid edited result
is accepted even when it differs from the starter. Shell access, other project
files, raw measurements and implementation verification are optional tools.

The first three chapters contain nine lessons. Their native reference checks cover
all starters and the documented edits, including intentional syntax/type failures,
comparison boundaries, an initially false loop condition, and accumulator reset.
The browser interface checks cover keyboard shortcuts/modals, saved drafts and
completion, cross-tab ownership, idle stop, failed-save retention, and widths from
320 to 1440 pixels in both themes. All nine starters have also passed through the real self-hosted guest compiler.
Cancellation, fresh-session persistence and idle-stop results are recorded in the
full guest verification record and CI run.

Desktop and phone layouts were inspected locally. This does not establish physical
Android performance or learning effectiveness. A complete offline runtime is still
not offered; saving a workspace is different from saving all runtime assets.

The local real-VM recovery check passed on 23 November 2026: saved TinyDB
records survived an IndexedDB checkpoint, manual runner stop, full page reload,
a fresh Linux VM and archive restoration. The idle checkpoint/shutdown check
also passed, with off-project requests blocked and no failed asset requests or
page errors. Edited compilation, intentional compiler failure, cancellation of
a live process and a successful rerun were checked separately. The complete
nine-starter journey is a publication-gating CI check. A focused persistence
invocation reports its scope explicitly and does not claim unexecuted checks.
