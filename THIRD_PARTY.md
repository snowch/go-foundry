# Sources and licences

Go Foundry's original interface, examples and tooling are MIT licensed; see LICENSE in the repository and source archive.

The root image redistributes the official Go 1.27.4 Linux/amd64 SDK, verified by tools/go-toolchain.json. Its BSD-style licence and patent grant are included at /opt/go/LICENSE and /opt/go/PATENTS. Prepared cache objects are compiled from that SDK and the project's MIT examples.

The minimal Linux userspace consists of BusyBox 1.37.0-r30 and musl 1.2.5-r24 from Alpine minirootfs 3.23.8. BusyBox is GPL-2.0-only; musl is MIT licensed. The image includes upstream source archives, the exact Alpine BusyBox packaging tree (recipe, config and patches, commit 1e823a60eb85606954b3a5af5f8e5bbd1ea680cf), and licence notices under /usr/share/go-foundry/sources. The same source downloads are offered alongside the prototype under downloads/sources/. tools/guest-packages.json records source URLs and SHA-256 hashes. No other Alpine package binaries are included. BusyBox also links the ISC-licensed utmps/skalibs libraries; their source, copyright notices and Alpine recipes are included with the corresponding source downloads. BusyBox's copyright holders and full terms are listed in its LICENSE and source archive; musl's copyright and terms are in MUSL-COPYRIGHT and its source archive.

The original TinyEMU build_filelist utility was used as a reference for our own HTTP/9P serializer. TinyEMU is MIT licensed, copyright Fabrice Bellard; https://bellard.org/tinyemu/.

JSLinux's x86-64 emulator, terminal and Linux kernel remain hosted by Fabrice Bellard at https://bellard.org/jslinux/. This project embeds that service and links to it; it does not copy or redistribute its emulator binary or kernel. The custom root image is not a fork of the hosted emulator. Do not assume that the public TinyEMU RISC-V source supplies rights for every current hosted x86-64 component.

IBM Plex Sans and Mono are bundled under SIL Open Font License 1.1; see fonts/*OFL.txt. Material Symbols SVGs are bundled under Apache License 2.0; see icons/LICENSE.txt. These files and notices are in the repository.
