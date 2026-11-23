# Runtime sources and licences

The current browser runtime is self-hosted v86 0.5.473 (BSD-2-Clause), xterm.js
6.0.0 and addon-fit 0.11.0 (MIT), SeaBIOS/SeaVGABIOS rel-1.16.2 (LGPL-3.0),
Alpine Linux x86 and the Go 1.27.4 Linux/386 SDK (BSD-3-Clause).

`tools/local-linux/assets.json` pins downloads by version and SHA-256.
`web/linux/vendor/` contains xterm's original licences. The build publishes v86's
licence, BIOS licence/configurations and source-assembly instructions in
`linux/notices/`. Alpine package versions, source origins, immutable build recipes,
upstream source locations and patches are recorded there. The Go source and
licence are included inside `/opt/go` in the guest. No upstream binary is patched.
The original course source remains under LICENSE.

Builds use an amd64 Go SDK and, on hosts without 32-bit execution, pinned QEMU
7.2.0 to prepare the guest compiler cache. These build-host tools are not shipped
to learners. Upstream access occurs during the build; browser execution uses only
this course's files. Optional external reference links require internet access.

The previous prototype used Bellard's externally hosted JSLinux terminal. Its
validation remains in `docs/validation-jslinux-legacy.json`; it is not evidence for
the current runtime. Do not mirror the current hosted x86 JSLinux binaries without
establishing redistribution rights. Active legacy guest files must be retained
through migration so existing sessions can export their work.

Reading and code fonts are locally bundled IBM Plex Sans and IBM Plex Mono under
SIL OFL 1.1; original licences are in `web/fonts/`. Functional icons are official
Material Symbols Rounded (outlined, weight 400, grade 0), Google
material-design-icons revision `10ecc14790612ca8fd164e3f4ffe9c16fc50d5b7`, under
Apache 2.0; source notes and the licence are in `web/icons/`.
