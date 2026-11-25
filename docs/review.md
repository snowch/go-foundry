# First chapters and runner review

## Visible run activity: plan

A disabled Run button and small status line can look inactive during a cold
startup or compilation. Add a visible indeterminate progress bar beside the
execution controls, with the actual startup/restore/compile/run/save phase and
elapsed time. Keep the Run button busy state and header indicator consistent,
identify the lesson that owns a background job, and avoid invented percentages
or completion estimates. Preserve Stop, edited source, output and project-saving
semantics. Check cold/warm runs, phase changes, cancellation, failure, course
switches, keyboard, reduced motion and phone/desktop themes.

The interface checks passed with a held cold startup, indeterminate progress,
elapsed time during a pending run, owner labels after switching courses, and
cleanup after cancellation/completion. The pending-run panel fits a 320px phone;
reduced motion stops the decorative spinner. Existing warm-run, storage failure,
cross-tab, keyboard and theme checks passed, as did native/reference checks.
These interface tests use a bridge fixture; actual guest execution is checked
independently by the publication workflow. No learning-effectiveness claim is
made by a visible activity indicator.

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

### Go series prototype: revised plan

C++ remains unchanged. Go now prototypes a series catalogue, three small lab landings, and lab-scoped lesson navigation. Each completed introductory chapter supplies one three-lesson lab. The catalogue counts labs; each lab counts only its own manual lesson marks. A landing names its prerequisites, offers Start/Continue/Review and links to the next lab. No empty advanced courses or completion locks are added. Existing lesson IDs, state keys, the shared guest and captured running jobs must remain stable across series/lab/lesson transitions. Verify legacy section aliases, per-lab boundaries, progress independence and mid-run switches in addition to the shared styling checks above.

### Go series prototype: review findings

The catalogue, prerequisite links and a lab landing were inspected on phone and desktop; the final lesson was inspected in both themes. Each lab presents three lessons, a local progress count and an explicit next-lab destination. The optional investigations remain separate. The shared layout checks passed for all nine lessons, canonical and legacy routes, per-lab card boundaries, cross-tab completion, retained drafts/predictions, history/reload, keyboard, zoom and 320–1440 px themes. Completing the first lab changes the catalogue to one of three labs complete and offers the next lab, without marking any of that lab's lessons.

The interface bridge check also passed a switch through catalogue → another lab → another lesson while a job was active. It retained one guest, disabled a second submission and returned to the lesson that owns the job. Native Go reference/edit checks and the series metadata contract passed. Real guest execution, cancellation and saved-project recovery are separate publication checks; interface stubs do not establish those results. These checks do not establish learning effectiveness or physical Android performance.

### Standalone courses: plan

The first prototype still looked like sections of one course: all homes used hash addresses and the header logo returned to the series. Give each lab a static course entry path, its own header name and home destination, and its own source-file menu. Keep the series directory separate and link it from the footer. Preserve old lesson and lab bookmarks, stored work and the shared runner. In-page course switches must retain an active guest; direct course loads/reloads must resolve all assets within the project scope. Verify independent course entry, browser back/forward, old aliases, modified-click/new-tab destinations and one retained running job alongside the existing layout and real-guest checks.

### Standalone courses: interface review

Local checks passed for all three static course entry pages, direct reloads, own-course header/home destinations, three-item lesson and source-file menus, old bookmark aliases, modified-click/new-tab entry, browser history, saved work and completion. Browser checks covered both themes and 320–1440 px without requests outside the project or missing assets. Resolving static resource URLs before history changes keeps the favicon and download links attached to their actual files. Phone course homes and the first/middle/final lesson layouts were inspected. The bridge check retained one active guest while moving through a course home, the series catalogue and another course, then returned to the original job for cancellation. Native/reference and route-contract checks passed. Actual guest execution and project recovery remain independently verified publication checks; these interface results do not establish learning effectiveness.

## Complete core series (113 lessons, twelve independent labs)

Before: three finished introductory labs with nine examples; the advanced
runtime investigations were useful probes but did not teach the later topics.
After: each course has its own purpose, stated prerequisites, scoped outline,
progress and next-course link. The series proceeds through functions/pointers,
collections/text, types/interfaces, errors/testing, files/HTTP, concurrency,
data structures, algorithms and a twelve-lesson persistent TinyDB project.
No lesson is gated by a completion mark. Original IDs and work keys are stable.

The sentence review distinguishes prepared inputs, edits, Run, named output
fields and interpretation. Text introduces local terms, states sorted-input,
weight and range assumptions, and distinguishes VM observations from native
performance and physical-disk durability. Optional references contain syntax
reminders rather than a second copy of the lesson. Diagrams show aliasing,
interface values, shutdown ownership, links and staged snapshot publication;
captions describe the starter rather than claiming to track edited code.

Originals and every documented edit have executable native fixtures, including
expected compilation failures and assertion failures. Browser interface checks
inspect every source/ref/navigation relationship; real guest checks execute
all starter packages and separately verify edited programs, Go test failure,
cancellation, cross-course navigation and saved-project recovery. The guest
capstone is reopened after stop, full reload and a fresh VM. These checks are
functional evidence, not evidence of improved learning outcomes.

The first complete-series CI run passed all 113 real-guest starters and the
edited-source, assertion-failure, cancellation, checkpoint, fresh-VM and database
reopening journey: [run 45264551201](https://github.com/snowch/go-foundry/actions/runs/45264551201).
The local native suite and interface suite also passed. An additional review
checked every lesson at 320 px and representative first/middle/final lessons at
390, 820 and 1440 px in both themes, including keyboard diagram scrolling.
Visual inspection then widened diagrams beyond the prose measure and separated
the worker-pool's result flow from its coordinator's close signal. Narrow figures
show an explicit scrolling hint; wide figures fit without horizontal scrolling.

## Series discovery and direct start

Before: the main directory repeated twelve Go tiles beside one tile for each
other Foundry. The Go grid alone occupied about 1,733 px on a 390 px phone, and
its hub's lab choices began at 1,182 px. The hub's primary action opened another
overview before the first lesson. Its cards stayed in one column below 900 px,
even where two readable columns would fit.

After: one Programming tile and one sidebar entry lead to the existing Go hub.
The hub keeps its twelve numbered labs, prerequisites and progress. A shorter
intro puts the direct Start/Continue action before the choices. The diagram
remains beside the intro on wide screens and follows the choices on narrow
screens. Card columns adapt to a minimum readable width; narrow phones keep a
single column. A completed last lesson leads to the next unfinished lesson,
while a wholly completed series offers review. Existing addresses and stored
work remain stable. Navigation never starts, stops or submits to the runner.

Check fresh start, returning draft/resume, completed-last advance and full-series
review; direct links, keyboard, history/reload, responsive column counts, diagram
order and both themes. Keep real execution and checkpoint verification separate
from interface checks, and do not infer learning effectiveness from passing tests.


## Foundry navigation

Use Course → Part → Chapter → Lesson. See the [navigation review](navigation-review.md)
for reading order, learner actions, compatibility and verification.
