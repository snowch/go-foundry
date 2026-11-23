# Go Foundry independent lab series

The twelve independent Go labs contain 113 editable lessons. C++ Foundry remains unchanged.

| Lab | Lessons | Prior knowledge |
| --- | --- | --- |
| 1. First programs | 6 | No Go experience is required. You only need to be comfortable editing text. |
| 2. Values and types | 8 | Uses declarations and printed output from First programs. |
| 3. Conditions and loops | 9 | Uses variables, comparisons and arithmetic. |
| 4. Functions and pointers | 9 | Uses values, conditions and loops. |
| 5. Collections and text | 11 | Uses functions and pointers. |
| 6. Types and interfaces | 12 | Uses functions, pointers and collections. |
| 7. Errors and testing | 11 | Uses interfaces, functions and collections. |
| 8. Files and HTTP | 9 | Uses errors, tests and structs. HTTP examples need no external service. |
| 9. Concurrency | 9 | Uses functions, channels introduced here, interfaces and error handling. |
| 10. Data structures | 8 | Uses slices, maps, pointers, methods and tests. |
| 11. Algorithms | 9 | Uses the data structures lab and recursion. |
| 12. Build a TinyDB | 12 | Uses files, errors, testing, maps and concurrency. This is an educational store, not a production database. |

The bare URL and `#home` show the series catalogue. Each lab is a separate learner-facing course with its own static entry URL, header name, homepage, purpose, linked prerequisites, lesson list, saved progress and Start/Continue/Review. The course logo returns to that course's homepage. The lesson outline and editor's other-file menu contain that course's lessons. The footer links back to the series directory. No lesson is locked by completion. Algorithms, data structures, concurrency and TinyDB have their own teaching labs. The older runtime investigations remain optional tools.

Canonical course paths are `/go-foundry/first-programs/`, `/go-foundry/values-and-types/` and `/go-foundry/conditions-and-loops/`. Each is directly loadable, reloadable and openable in a new tab. A lesson keeps its existing hash within its course, for example `/go-foundry/values-and-types/#types`. Older root lesson hashes, `#lab/<id>` and `#course/section-1` through `section-3` still resolve to the matching course without discarding stored work. Section breadcrumbs and the current lab's outline lead to its own homepage. Previous/next stays inside the lab; its first and final lesson cards return to that homepage. Homes provide an explicit next-lab link and a route back to all labs. External course directories should list each course as a separate tile linking to its canonical homepage.

The shared application owns one runner, compiler cache and saved project. Same-tab course links update browser history and presentation without reloading the document. Moving between labs must not start, stop or recreate Linux, submit a job, clear work or misattribute output. A job retains the source and lesson ID captured by Run. The learner can return to that lesson while a different lab is open. Direct loads/new tabs retain the existing restore and cross-tab lock behaviour. Compiler, fonts and other shared assets stay self-hosted inside the Go Foundry project; metadata and runtime URLs resolve from the shared module location, not the course subdirectory.

Progress is derived from the existing `go-foundry:v1:done/<lesson-id>` keys. Lab progress counts only its own lessons; a lab is shown complete when all of those explicit lesson marks are set. That is a progress marker, not proof of understanding. The catalogue summarises labs, rather than promoting a large global lesson denominator. Draft, prediction, result and IndexedDB project keys do not change. Additional per-lab `last-lesson/<lab-id>` values select Continue without migrating or overwriting old records. Completion reconciles across tabs independently of source and predictions.

One repository, one build and shared components keep styling, runtime and recovery consistent. Future Foundry series should use the same separation between catalogue, lab landing and lesson. Course metadata and the canonical source files define the curriculum boundaries.
