# package-sync-version

> Sync version of monorepo packages locally.

[![License](http://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/miguelmota/package-sync-version/master/LICENSE)
[![NPM version](https://badge.fury.io/js/package-sync-version.svg)](http://badge.fury.io/js/package-sync-version)

## Install

```bash
npm install -g package-sync-version
```

## Usage

```bash
$ package-sync-version [package-name]
```

### Examples

Sync a package version with all other packages in monorepo:

```bash
$ cd monorepo/

$ package-sync-version @acme/foobar
```

Sync current directory package version with all other packages in monrepo:

```bash
$ cd monorepo/packages/foobar/

$ package-sync-version
```

## License

[MIT](LICENSE)
