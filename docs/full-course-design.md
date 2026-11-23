# Go Foundry: complete core series

The expansion is being authored and verified on the development branch. The
published introductory lesson IDs, course URLs and saved-work keys remain stable.
New course links will be added to the public directory once their content and
execution journeys are verified.

The goal is to let a learner who can edit text progress from a first Go program
to tested programs, concurrent work, data structures and algorithms, and a small
persistent record database. Installing Go, using a shell or knowing Linux is not
an entry prerequisite. The browser uses a real pinned Go compiler and self-hosted
Linux; emulated timings do not measure native performance.

| Independent lab | Practical outcome | Required prior ideas |
| --- | --- | --- |
| First programs | Print, format, reorder and repair source | Editing text |
| Values and types | Declare, assign, convert and bound values | First programs |
| Conditions and loops | Select branches, trace repetition and accumulate results | Variables and arithmetic |
| Functions and pointers | Reuse calculations, pass operations and update caller-owned values | Branches, loops and types |
| Collections and text | Use arrays, slices, maps and Unicode text without confusing copies and aliases | Functions and basic types |
| Types and interfaces | Design structs, methods, composition and constrained generic operations | Functions, pointers and collections |
| Errors and testing | Report failures, preserve causes and execute real Go tests | Functions, interfaces and collections |
| Files and HTTP | Read, encode and exchange bounded data with explicit error handling | Errors, interfaces and tests |
| Concurrency | Coordinate goroutines, ownership, cancellation and shutdown | Functions, collections and errors |
| Data structures | Implement and inspect containers and their invariants | Collections, pointers and types |
| Algorithms | Compare searches, sorts and graph/sequence algorithms using observable work | Functions, collections and data structures |
| TinyDB | Build and verify record validation, CRUD, indexes, snapshots and recovery | Files, errors, tests and data structures |

Each lesson has a complete runnable starter, a concrete question, a source edit
that is possible in the editor, named output evidence and an interpretation.
Transfer tasks ask learners to extend behavior or predict a fresh case, rather
than only retype a demonstrated line. Test assertions, source compilation errors,
program failures and browser/runtime failures must retain different meanings.
References give useful syntax reminders and primary Go documentation.

Concept diagrams belong where text alone makes a learner track shared storage,
channel dependencies, graph/tree relationships or staged database writes. A
figure names the relationship and its starter assumptions. It must not pretend
to update when the learner edits source or depict a physical address/timing that
was not measured.

New examples and their documented edits are compiled and executed with the
pinned native reference toolchain in isolated temporary workspaces. Publication
also requires actual browser-guest starters, representative edited/test/error
runs, course navigation, cancellation and saved-project recovery. Multi-file
examples expose the needed files through Editor tools. No essential action asks
learners to edit a hidden or read-only setup.

The TinyDB project is an educational bounded record store. Its virtual-filesystem
snapshot replacement and browser checkpoints do not establish physical
power-loss durability, SQL compatibility or a production transaction system.
Functional checks establish executable examples and interface behavior; they do
not establish learning effectiveness.
