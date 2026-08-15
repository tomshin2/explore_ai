# Lock to a stable base image
FROM rockylinux:8

# ======================================================================
# ROLE OF THIS IMAGE
# ----------------------------------------------------------------------
# Development + compile ONLY: npm install, Metro dev server, typecheck,
# tests, expo export. Native tooling is intentionally absent:
#   - iOS (Xcode/CocoaPods): macOS-only, impossible in a container — the
#     Mac (macos/Brewfile.gui) builds + previews iOS.
#   - Android (JDK 17/Android SDK/emulator): preview happens on the Mac;
#     add java-17-openjdk + cmdline-tools ONLY if Android compile ever
#     moves into the container.
#
# SDK-COUPLED KNOB (the only one):
#   nodejs:22 major must stay in lockstep with the Mac's `node@22`
#   (macos/Brewfile). Bump both together on an Expo SDK upgrade.
#   Patch (22.23.1) is a reproducibility lock, NOT tied to the SDK.
#
# ENV: copy the real keys before running the dev server / export
#   cp .env.example .env   (fill from Supabase -> Project Settings -> API)
#
# ======================================================================
# TOOL MANIFEST — single source of truth
# ----------------------------------------------------------------------
# Add a line to install a tool, remove a line to drop it.
# All entries are the latest stable builds available on aarch64
# (Rocky Linux 8.10).
#
#   TOOL_MANIFEST   : plain RPMs -> locked via `dnf versionlock`
#   MODULE_MANIFEST : module streams to enable (Node.js)
#   MODULE_PINS     : exact NEVRAs of the module packages
#   EPEL_RELEASE    : EPEL repo package (needed by ripgrep)
#
# Intentional exclusions for this JS-only project (see ROLE above):
#   - flex / bison : parser generators, only needed to build from source
#   - gdb / strace : native debuggers
#   - go-toolset   : Go toolchain
# Uncomment the lines below to re-enable any of them.
# ======================================================================
ARG TOOL_MANIFEST="\
    autoconf-2.69-29.el8_10.1 \
    automake-1.16.1-8.el8 \
    binutils-2.30-128.el8_10 \
    gcc-8.5.0-28.el8_10 \
    gcc-c++-8.5.0-28.el8_10 \
    glibc-devel-2.28-251.el8_10.40 \
    libtool-2.4.6-25.el8 \
    make-4.2.1-11.el8 \
    pkgconf-1.4.2-1.el8 \
    which-2.21-21.el8_10 \
    python3.12-3.12.13-3.el8_10 \
    python3.12-devel-3.12.13-3.el8_10 \
    python3.12-pip-23.2.1-4.el8 \
    git-2.43.7-1.el8_10 \
    ripgrep-14.1.1-1.el8 \
    jq-1.6-12.el8 \
    tree-1.7.0-15.el8 \
    wget-1.19.5-12.el8 \
    zsh-5.5.1-10.el8"

# go-toolset: not needed for this JS-only project; uncomment if you want Go.
ARG MODULE_MANIFEST="nodejs:22"
ARG MODULE_PINS="\
    nodejs-22.23.1-2.module+el8.10.0+40261+cde646a4 \
    npm-10.9.8-1.22.23.1.2.module+el8.10.0+40261+cde646a4"

ARG EPEL_RELEASE=epel-release-8-22.el8

# 1. Refresh metadata, install the version-locking plugin and EPEL (pinned)
RUN dnf clean all \
    && dnf makecache --enablerepo=devel \
    && dnf install -y --enablerepo=devel dnf-plugin-versionlock ${EPEL_RELEASE} \
    && dnf makecache --enablerepo=devel

# 2. Enable the module streams referenced by the manifest
RUN dnf module enable -y $MODULE_MANIFEST

# 3. Bind every manifest entry to the version registry
RUN dnf versionlock add --enablerepo=devel $TOOL_MANIFEST $MODULE_PINS

# 4. Install the exact locked versions, then drop cached metadata
RUN dnf install -y --enablerepo=devel $TOOL_MANIFEST $MODULE_PINS \
    && dnf clean all

# 5. Clean shortcut symlinks for global execution pathways
RUN ln -s /usr/bin/python3.12 /usr/local/bin/python3 \
    && ln -s /usr/bin/pip3.12 /usr/local/bin/pip3
