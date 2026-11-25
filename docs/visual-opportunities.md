# Visual opportunities across the whole course

Reviewed on 25 November 2026 against `cc41b9b588218efb70c3e9c6d4e6ee3450f771da`. This extends the review beyond existing diagrams: 113 lessons have coverage records, including 22 newly illustrated lessons and 6 revised models.

Follow the [shared course-design guide](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md). No dedicated UX or learning skill was available; this records equivalent design and learning reviews.

## Learning review

Look for references to shared objects, changing slots, exclusive bounds, call/return state, alternative branches, dependency edges, occupancy thresholds and publication/retention boundaries. Add a model when it answers a named question more directly than code/output alone. Keep simple syntax, API lookup and one-step results concise. The JSON companion quotes the passage, pins the starter source, and records each selected question, parts, connections, values, units and assumptions. Keep prerequisite definitions visible. Static models explicitly describe the supplied example, not arbitrary source edits.

## Presentation review

Before: spatial relationships were sometimes encoded in prose cards, small labels or a differently sized example. After: stable indexed cells for storage/ranges, converging name-to-object edges for aliases, actual graph/tree links, explicit alternatives, and labelled dependency tables. Essential model labels use live text at 16px or larger. Use theme roles and text/shape cues as well as color. Retain local scroll only where needed; never shrink the whole model to conceal small type.

## Reading order and scope

Keep the course’s existing reading order and compact lesson navigation. Put models next to the worked explanation/result without moving the editor into another page. Models never execute code, modify source/Input, write storage or mark completion. Keep the existing fgets interaction in C. A model can replace repeated relationship narration; it does not replace preconditions, definitions or caveats.

## Curated additions and revisions

| Lesson | Decision | Question answered |
| --- | --- | --- |
| [Choose which variable an assignment changes](https://snowch.github.io/go-foundry/functions-and-pointers/#scope-and-shadowing) | Added | Why does outer still print 10 after the block prints 3? |
| [Change a caller’s variable through a pointer](https://snowch.github.io/go-foundry/functions-and-pointers/#value-and-pointer) | Added | Why does only bumpPointer change the caller’s count? |
| [Keep state in a returned function](https://snowch.github.io/go-foundry/functions-and-pointers/#closures) | Added | Why do next() calls return 1,2 while other() starts at 1? |
| [Select a slice of a sequence](https://snowch.github.io/go-foundry/collections-and-text/#slice-bounds) | Added | Why does values[1:3] have length 2 and values [4,6]? |
| [Grow a slice](https://snowch.github.io/go-foundry/collections-and-text/#append-capacity) | Added | Why does append(values,7,8) report grew=false? |
| [Follow two slices into shared storage](https://snowch.github.io/go-foundry/collections-and-text/#slice-aliases) | Revised | Why do left[1] and right[0] both become 9? |
| [Copy values into separate storage](https://snowch.github.io/go-foundry/collections-and-text/#copy-slices) | Revised | Why does changing copied[0] leave original[0] equal to 2? |
| [Count bytes and Unicode code points](https://snowch.github.io/go-foundry/collections-and-text/#unicode-text) | Added | Why do range indices jump from 0 to 2? |
| [Copy a struct value](https://snowch.github.io/go-foundry/types-and-interfaces/#struct-values) | Added | Why is original still {2,3} after moved.X=9? |
| [Compare a nil pointer and an interface](https://snowch.github.io/go-foundry/types-and-interfaces/#nil-interfaces) | Revised | Why is pointer==nil true while value==nil is false? |
| [Pass a result through a channel](https://snowch.github.io/go-foundry/concurrency/#channel-handoff) | Added | Why can the send of 7 complete only with a receiver? |
| [Queue values in a buffered channel](https://snowch.github.io/go-foundry/concurrency/#buffered-channel) | Added | Why does one receive leave one pending value? |
| [Finish a stream of messages](https://snowch.github.io/go-foundry/concurrency/#close-and-range) | Added | Why does range finish with sum 6? |
| [Cancel work and wait for its exit](https://snowch.github.io/go-foundry/concurrency/#context-cancel) | Added | What confirms the worker has observed cancellation? |
| [Share jobs among a bounded set of workers](https://snowch.github.io/go-foundry/concurrency/#worker-pool) | Revised | Why must main receive results before the workers can finish? |
| [Protect a shared read-modify-write](https://snowch.github.io/go-foundry/concurrency/#mutex-counter) | Added | Why do two workers reliably produce count 200? |
| [Stop an upstream producer when consuming only one result](https://snowch.github.io/go-foundry/concurrency/#pipeline-shutdown) | Added | Why must main wait for done before reporting producer stopped? |
| [Reuse a fixed queue buffer](https://snowch.github.io/go-foundry/data-structures/#ring-buffer) | Added | Why is put(9) rejected and take returns 3? |
| [Follow links rather than contiguous indexes](https://snowch.github.io/go-foundry/data-structures/#linked-list) | Revised | Which node does the new node 3 point to? |
| [Find a key inside a collision bucket](https://snowch.github.io/go-foundry/data-structures/#hash-collisions) | Added | Why can Ada and Bob coexist in bucket 1? |
| [Keep smaller and larger values on separate branches](https://snowch.github.io/go-foundry/data-structures/#search-tree) | Added | Why does the traversal print [2,4,6]? |
| [Remove the smallest priority](https://snowch.github.io/go-foundry/data-structures/#minimum-heap) | Added | Why does heap.Pop return 2 and leave length 2? |
| [Discard half a sorted search interval](https://snowch.github.io/go-foundry/algorithms/#binary-search) | Added | Why is 11 found at original index 5 after 3 checks? |
| [Visit a graph by distance in edges](https://snowch.github.io/go-foundry/algorithms/#breadth-first-search) | Added | Why does D appear once even though B and C both lead to it? |
| [Schedule tasks only after prerequisites](https://snowch.github.io/go-foundry/algorithms/#topological-order) | Added | Why is [0,1,2] a complete order? |
| [Update a row without changing the old snapshot](https://snowch.github.io/go-foundry/tinydb/#db-update) | Added | Why does the old score stay 42 when next has score 60? |
| [Publish a validated replacement snapshot](https://snowch.github.io/go-foundry/tinydb/#db-publish) | Revised | Which failure must keep the previous destination intact? |
| [Commit related changes together or keep the old snapshot](https://snowch.github.io/go-foundry/tinydb/#db-transaction) | Added | Why does the returned snapshot still have score 42 and one row? |

## Complete coverage

See [all per-lesson decisions, passages and model specifications](visual-opportunities.json). “Keep prose” means no additional visual is selected for that focused objective in this pass; it is not a claim that no possible illustration could help. Existing figures outside the changed set remain available.

## Verification

- `npm run build` and `npm test` passed, including immutable frontend retention checks for the two new model modules.
- Native reference tests passed with the pinned Go toolchain.
- `npm run test:browser` passed for background jobs, output, cancellation, saved drafts/progress, project restoration, storage failures, keyboard access, themes, responsive layouts and hub navigation. These interface tests use a guest bridge stub.
- `npm run test:navigation` passed across all 4 parts, 12 chapters and 113 lesson destinations.
- `npm run test:visuals` passed for 28 models across 168 viewport/theme states, with readable labels, valid byte groups/edges, expanded text equivalents, no page overflow or overlapping graph nodes and no automatic compiler/guest startup.
- Separately, `CHROMIUM_PATH=/usr/bin/chromium node tests/self-hosted-linux.cjs go --lab concurrency --examples-only` passed all 9 concurrency starters in the real browser Linux guest, including worker-pool, mutex-counter and pipeline-shutdown.

These checks verify behavior and presentation; they do not measure learning effectiveness or native/multicore performance.

The worker-pool refinement draws the four goroutines and the two shared unbuffered channel objects directly. The close/wait chain stays in a separate note; positions are not a time axis. Targeted 320/390/768px checks cover both nodes and labels. Content-sized absolute nodes prevent the right-hand channel and receiver from shrinking on narrow screens. The complete figure, interface and navigation suites passed again. The CSS-only frontend rebuild reused the verified unchanged guest image and checked that its image identity and immutable Linux graph were unchanged; the nine real concurrency starters had already passed against that image.
