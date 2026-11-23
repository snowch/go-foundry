# Shared course style in Go Foundry

The [shared course design guide](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md) is the common standard for this course and CUDA C++ Lab. This adapter describes Go-specific decisions, not another copy of the shared rules.

The bare URL and `#home` open the course home. Three visible chapter groups introduce nine lessons, with a compact source → compiler → program/output illustration and a Start or Continue action. `#course/section-1`, `section-2`, and `section-3` locate the actual chapter on that home. Optional runtime investigations have their own group. Existing direct lesson and investigation hashes remain valid.

Each lesson opens with one combined course row: disclosure, saved progress, linked chapter and current lesson. The inline outline pushes content down and uses one, two or four columns as titles fit. Completed lessons have an independent Material tick; all destinations remain available. Completion reconciles across tabs without replacing another tab's source or prediction.

A lesson presents purpose, essential definitions, a concrete action, an optional saved prediction, the full editable program and its output, then result interpretation. Go syntax uses a read-only highlighting layer behind the native textarea; source bytes, selection, IME and the accessible editor remain authoritative. Show edit target selects the relevant source line without replacing edited work. A missing target is reported instead of silently restoring the starter.

Topic-specific References near the bottom include short reminders, syntax and direct Go documentation links. Optional runner/backups and runtime evidence use the same full-width Material resource rows. Completion is separate from previous/next cards. The first and final lessons return to the course overview at the appropriate end of the sequence.

The course uses the shared colour roles, locally bundled IBM Plex fonts and official Material Symbols Rounded, outlined weight 400/grade 0. Go retains its subject mark. The home illustration sits beside the text above 900 px and below it when narrower. Code remains 16px, including phones, and wide source scrolls inside its editor.

The Linux frame is owned outside the home/lesson views and survives hash navigation. A running job keeps its captured source and lesson identity; its result remains attached to that lesson. The first startup notice appears immediately with a dimmed modal backdrop and remains until dismissed; starting manually from the explanatory Code runner settings acknowledges that notice. It does not reappear for the later Run. Runtime startup, cancellation, checkpointing, idle shutdown and storage namespaces retain the existing [runner contract](background-runner.md). Saving project files does not imply a complete offline course; no unsupported offline controls are introduced.

Verification covers home and direct links, grouped/current/completed outline states, Escape/focus, section destinations, browser history/reload, independent saved state, references, source fidelity/target selection, both themes, 320–1440px layouts and zoom. Real guest execution and recovery remain separate publication checks.
