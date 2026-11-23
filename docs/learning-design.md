# First three chapters

The standalone prototype presents these outcomes as three separate introductory
courses. Each course has its own homepage, prerequisites, three-lesson menu,
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

Later chapters (functions, collections, errors, data structures, algorithms and a
TinyDB project) remain future course work. The earlier runtime investigations are
retained as an optional navigation group; they are not presented as beginner
prerequisites.

## Shared course presentation adoption

Use the canonical [shared course design guide](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md), also required by CUDA C++ Lab. No new Go knowledge or shell prerequisite is introduced by this presentation change.

The practical outcome is finding, attempting and revisiting one lesson without losing work. Likely misconceptions are that opening course navigation reruns code, that a completion mark certifies correctness, or that previous output belongs to a newly edited source. Keep one clear Run action, code/output together, a saved optional prediction before execution, explicit previous-output labelling, and reversible completion independent of execution. Preserve the nine complete examples and their documented edits. The transfer task remains each lesson's deliberate source change and interpretation question.

The course home provides prerequisites, a compact compiler illustration, a Start action and grouped progress. Direct lesson hashes remain valid. Review the essential path with optional resources closed and exercise navigation, back/forward, section destinations, completion, saved drafts/predictions/results and a running guest.

## Small-lab series prototype

The three completed chapters become three introductory prototype labs, each with three existing lessons: First programs, Values and types, and Conditions and loops. This validates the series interface without presenting unwritten algorithms, data-structures or TinyDB courses as finished. The practical outcome is choosing one bounded learning goal, understanding its prerequisites, and returning to its own progress and outline.

The first lab needs no Go experience. Values and types builds on running a program and repairing a simple compiler error; Conditions and loops uses the variables and arithmetic taught in Values and types. Prerequisites are recommendations rather than completion locks. The examples and transfer tasks stay unchanged. Prototype boundaries can expand as later content is authored; lesson identifiers and saved work must survive any regrouping.
