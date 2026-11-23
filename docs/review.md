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

## Shared course style: plan and review criteria

Applied the existing [UX skill](https://github.com/snowch/causal-inference-lab/blob/main/.agents/skills/ux/SKILL.md) and [learning-design skill](https://github.com/snowch/causal-inference-lab/blob/main/.agents/skills/learning-design/SKILL.md), plus the canonical [course design guide](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md). The skill files are shared workspace sources; this repository links to the canonical guide rather than copying its rules.

Before implementation: separate the compact course home from lesson views; use the combined course row with linked section location and completion ticks; move saved prediction before execution and interpretation after output; provide topic reminders in References and a distinct completion row followed by previous/next cards. Keep runner/backups optional and keep the Linux iframe alive through in-page navigation. Use bundled Material Symbols Rounded, common colour roles, IBM Plex typography and code/results at the wider course width. Review actual reading order, focus, touch targets, themes, zoom, errors and stored-work preservation after implementation. Functional checks do not establish learning effectiveness.

### Shared-style review findings

The built essential route was reviewed with optional panels closed on the first, middle and final lessons. Actions and the saved prediction precede the editor; actual output is followed by interpretation. Topic-specific references and optional tools precede a separate completion row and destination-labelled navigation cards. The course home identifies prerequisites and the startup internet requirement.

Local browser checks passed for the separate home, all nine direct lessons, section destinations, inline outline behaviour, history/reload, retained drafts/predictions, completion reconciliation, reference reminders, syntax-source fidelity, target selection and both themes at 320, 390, 600, 820, 900, 901, 1100 and 1440 px. A 200% CSS zoom check supplements the narrow layouts. Required requests stayed inside the project scope. The interface bridge separately verifies that navigation during a run retains the same guest/job, identifies which lesson owns its output, and does not start another job. First startup notice timing and manual-start acknowledgement are covered.

Screenshots of phone and desktop lesson endings were inspected. Sticky headers are captured at the top of full-page evidence images to avoid screenshot-only duplication at the current scroll position. The native syntax renderer preserves Unicode, raw strings, incomplete edits and source text exactly; colour is an aid, not a compiler check. Real VM starter/edit execution and saved-project recovery remain independent publication checks. Physical Android input/performance and learning effectiveness are not established by these checks.
