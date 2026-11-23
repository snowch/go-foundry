# Working on Go Foundry

Use the canonical [shared course design guide](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md), also used by CUDA C++ Lab. Link to it rather than keeping a competing copy. See [this course's adoption](docs/course-style.md) and [background runner contract](docs/background-runner.md).

- Keep Go prerequisites, examples and terminology appropriate to the learner. Keep essential actions and explanations visible; technical inspection is optional.
- Use an available UX/design skill and a learning-design skill for learner-facing changes, or document equivalent reviews when unavailable. Record the before/after reading-order and functional review in `docs/review.md`.
- Preserve stable lesson hashes and the `go-foundry:v1:` draft, prediction, completion and result keys. Project IndexedDB storage, locks and runner lifetime are independent of navigation and presentation. Navigation must never run code or discard the guest.
- Serve required assets from this lab's own project scope, including fonts, Material Symbols, compiler and Linux files. Preserve licences and source pins.
- Build with `npm run build`; run `npm test` and `npm run test:browser` for interface changes. Use `npm run test:linux` for runner, route or execution changes, including a real starter/edit and saved-project recovery. Report browser stub checks separately from real guest execution.
- Inspect the built homepage and representative first/middle/final lessons, both themes, phone/tablet/desktop layouts, keyboard/focus, references, completion and previous/next navigation. Functional tests do not prove learning effectiveness.
