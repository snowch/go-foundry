# Shared course style in Go Foundry

The [shared course design guide](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md) is the common standard for this course and CUDA C++ Lab. This adapter describes Go-specific decisions, not another copy of the shared rules.

The bare URL and `#home` open All parts: four numbered parts contain the existing
12 chapters and 113 lessons. Part overviews group chapters and their lessons;
each chapter has an overview with its own prerequisites and progress.
Start/Continue opens the first or resumed unfinished lesson. The header brand
returns to All parts and its subtitle identifies the current part. Original
chapter paths, `#lab/<id>`, `#course/section-N`, lesson and investigation hashes
remain valid. Runtime investigations remain separate from the reading sequence.

Course contents opens an inline outline. The initial view shows the current
part's chapters; the filter can show another part or all parts without changing
the current lesson or editor. Numbered parent links identify All parts, Part and
Chapter; the lesson position identifies its place in that chapter. Escape closes
the outline and focuses its trigger. Choosing the current lesson closes it and
focuses the heading. Modified clicks keep normal browser behaviour. Completion
reconciles across tabs without replacing another tab's source or prediction.

A lesson presents purpose, essential definitions, a concrete action, an optional saved prediction, the full editable program and its output, then result interpretation. Go syntax uses a read-only highlighting layer behind the native textarea; source bytes, selection, IME and the accessible editor remain authoritative. Show edit target selects the relevant source line without replacing edited work. A missing target is reported instead of silently restoring the starter.

Topic-specific References near the bottom include short reminders, syntax and direct Go documentation links. Optional runner/backups and runtime evidence use the same full-width Material resource rows. Completion is separate from previous/next cards. The first lesson links back to its part overview. Previous/Next lesson cross chapter boundaries within a part. At the final lesson, Next part opens the following part overview; the final part links to All parts.

The course uses the shared colour roles, locally bundled IBM Plex fonts and official Material Symbols Rounded, outlined weight 400/grade 0. Go retains its subject mark. The home illustration sits beside the introduction above 900 px and after the part choices when narrower. Cards fit one, two or three columns according to a 17rem minimum readable width. Code remains 16px, including phones, and wide source scrolls inside its editor.

The Linux frame is owned outside the home/lesson views and survives course-path and hash navigation. A running job keeps its captured source and lesson identity; its result remains attached to that lesson. The first startup notice appears immediately with a dimmed modal backdrop and remains until dismissed; starting manually from the explanatory Code runner settings acknowledges that notice. It does not reappear for the later Run. Runtime startup, cancellation, checkpointing, idle shutdown and storage namespaces retain the existing [runner contract](background-runner.md). Saving project files does not imply a complete offline course; no unsupported offline controls are introduced.

Verification covers home and direct links, grouped/current/completed outline states, Escape/focus, section destinations, browser history/reload, independent saved state, references, source fidelity/target selection, both themes, 320–1440px layouts and zoom. Real guest execution and recovery remain separate publication checks.


## Foundry navigation

Use Course → Part → Chapter → Lesson. See the [navigation review](navigation-review.md)
for reading order, learner actions, compatibility and verification.
