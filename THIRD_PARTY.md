# Sources and licences

Go Foundry's original prototype, examples, interface and tooling are MIT licensed; see LICENSE in the repository and source archive.

The toolchain image redistributes the unmodified official Go 1.27.4 Linux/amd64 SDK, identified by the SHA-256 in tools/go-toolchain.json. Go's BSD-style licence and patent grant are included as go/LICENSE and go/PATENTS in the mounted filesystem. Prepared cache objects are built from that SDK and this project's MIT examples.

The filesystem metadata implements TinyEMU's documented HTTP/9P format. The original TinyEMU build_filelist utility, used as the protocol reference, is MIT licensed and copyright Fabrice Bellard. See https://bellard.org/tinyemu/.

JSLinux's x86-64 emulator, terminal and Alpine Linux base remain hosted by Fabrice Bellard at https://bellard.org/jslinux/. This project embeds that service and links to it; it does not copy or redistribute its emulator binary, kernel or OS image. A custom Go filesystem layer is not a fork or redistribution of the hosted x86-64 emulator.

IBM Plex Sans and Mono are bundled under SIL Open Font License 1.1; see fonts/*OFL.txt. Material Symbols SVGs are bundled under Apache License 2.0; see icons/LICENSE.txt. Source and licence documents are available in the repository.
