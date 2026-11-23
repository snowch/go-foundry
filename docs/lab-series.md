# Go Foundry small-lab prototype

C++ Foundry remains unchanged. Go prototypes the series navigation using its three finished introductory chapters as three small labs, rather than inventing unfinished advanced courses:

| Lab | Lessons | Prior knowledge |
| --- | --- | --- |
| First programs | Print a greeting; print two lines; read a compiler error | Comfortable editing text; no Go experience |
| Values and types | Name a value; choose a type; divide whole numbers | Run a program and repair a simple compiler error |
| Conditions and loops | Choose a path; repeat a statement; build a running total | Variables and arithmetic from Values and types |

The bare URL and `#home` show the series catalogue. Each lab has a landing page with a purpose, linked prerequisites, its own lesson list, saved progress and Start/Continue/Review. No lesson is locked by completion. Algorithms, data structures, concurrency and TinyDB can become further labs when teaching content exists. The older runtime investigations remain optional tools, not substitutes for those future courses.

Canonical lab routes are `#lab/first-programs`, `#lab/values-and-types` and `#lab/conditions-and-loops`. Existing direct lesson/investigation hashes remain valid; `#course/section-1` through `section-3` resolve to the matching lab. Section breadcrumbs and the current lab's outline lead to that lab's landing page. Previous/next stays inside the lab; its first and final lesson cards return to the lab overview. Landing pages provide an explicit next-lab link and a route back to all labs.

The single application owns one runner, compiler cache and saved project. Moving between labs must not start, stop or recreate Linux, submit a job, clear work or misattribute output. A job retains the source and lesson ID captured by Run. The learner can return to that lesson while a different lab is open.

Progress is derived from the existing `go-foundry:v1:done/<lesson-id>` keys. Lab progress counts only its own lessons; a lab is shown complete when all of those explicit lesson marks are set. That is a progress marker, not proof of understanding. The catalogue summarises labs, rather than promoting a large global lesson denominator. Draft, prediction, result and IndexedDB project keys do not change. Additional per-lab `last-lesson/<lab-id>` values select Continue without migrating or overwriting old records. Completion reconciles across tabs independently of source and predictions.

One repository, one build and shared components keep styling, runtime and recovery consistent. Future Foundry series should use the same separation between catalogue, lab landing and lesson. The final curriculum boundaries need not match these deliberately small prototype labs.
