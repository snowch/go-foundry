# Go Foundry learning design

The series presents twelve independent courses with 113 lessons. Each course
has its own homepage, prerequisites, bounded lesson menu,
progress and course identity. The series directory provides discovery and an
optional learning order. Compiler tools and saved work remain shared underneath;
changing a course does not add a prerequisite or automatically run an example.

The essential route assumes no Go experience. Learners must be able to use a web
editor and a Run button; installing Go, using a shell, and understanding Linux are
not prerequisites. Linux implementation details belong in optional runner tools.

| Chapter | Practical outcome | Misconception addressed | Transfer task |
| --- | --- | --- | --- |
| First programs | Edit, compile and run a greeting; trace statement order; repair a syntax error using its line number | Editing source changes output without rerunning; comments execute; an earlier successful result proves broken source ran | Reorder two complete statements and explain the new output |
| Values and types | Name values, recognise four types, and use integer division/remainders | An expression automatically changes its variable; text and integers are interchangeable; integer division preserves a fraction | Predict groups and remainder for 8 and 9 items |
| Conditions and loops | Test a boundary, trace a loop, and retain an accumulator across repetitions | >= excludes equality; loops always execute once; resetting an accumulator each repetition keeps a running total | Change the loop limit, then move the initialisation and explain both outputs |

Each lesson presents its purpose, definitions, prepared source, precise edit and
Run instruction, observable output, and interpretation. The original result is an
optional comparison, not an assertion that every valid edit must match. Compiler
errors clear the previous run output and show a distinct failed execution state.
Completion is learner-controlled and saved independently of execution.

The starter and all documented edits have executable native reference checks.
Real browser tests run every starter through the actual guest compiler and check
edited execution, compiler errors, cancellation, and saved project restoration.
These are functional checks. They do not demonstrate learning effectiveness or
establish acceptable startup performance on physical Android devices.

The expanded sequence is specified in [full-course-design.md](full-course-design.md).
Functions distinguish copies from pointer updates; collections distinguish slice
views from independently copied storage; interfaces distinguish a typed nil from
an empty interface. Errors preserve causes, and tests check behavior rather than
merely reproducing a source line. Files/HTTP examples use prepared local inputs
without requiring outside services. Concurrency requires explicit completion and
shutdown ownership instead of sleeps. Data structures state empty/full and
ordering invariants; algorithms state sorted-input, edge-weight and counting
assumptions. TinyDB separates in-memory updates, file publication and browser
project checkpointing, then reopens a real saved database after a fresh VM.

Each new lesson has a runnable original, an executable suggested edit, explicit
result evidence and a further prediction or design question. Particularly useful
transfer exercises include implementing a lower clamp bound, case-insensitive
word counting, choosing a missing-input test case, identifying which slice views
change, predicting a newly chosen graph edge and checking persistence independently
of a repeated write. These tasks are opportunities to assess understanding;
passing the implementation tests alone does not assess a learner's reasoning.

Diagrams are optional additions to essential visible explanations, not hidden
substitutes. They show specific relationships in the starter and keep assumptions
visible. Inspect diagrams at phone sizes with keyboard scrolling as well as at
full width. The earlier runtime investigations remain optional tools and do not
replace any of the teaching labs.
