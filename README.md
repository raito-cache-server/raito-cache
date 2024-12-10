[![NPM Version](https://img.shields.io/npm/v/raito-cache)](https://www.npmjs.com/package/raito-cache)
[![Node.js CI](https://github.com/stbestichhh/raito-cache/actions/workflows/node.js.yml/badge.svg)](https://github.com/stbestichhh/raito-cache/actions/workflows/node.js.yml)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

# Raito-Cache

## Table of contents

* [Description](#about)
* [Getting started](#getting-started)
  * [Installation](#installation)
  * [Command Line Interface](#cli)
* [Contributing](#contributing)
* [Changelog](#changelog)
* [Authors](#authors)
* [License](#license)

## About

**raito-cache** - is lightweight caching proxy server built. This server intercepts requests, caches responses, and serves them from the cache, improving performance by reducing redundant network calls. It also includes command line interface with command handling functionality.

## Getting started

> [!IMPORTANT]
> **Node.js 18.x+** version must be installed in your OS.

### Installation
  ```shell
  $ yarn add -g raito-cache
  ```

### CLI

**Start the server:**
```text
Usage: raito-cache --port <port> --origin <url> [options]

Lite caching proxy server

Options:
  --host <host>   define host on which to start the server (default: "localhost")
  --ttl <time>    define time to live for cache in milliseconds
  -v, --version   output the version number
  -h, --help      display help for command
```

**Server commands:**
* `status` - check server status
* `stop` - stop the server without exiting
* `start` - start the server
* `exit` - stop the server and exit the process
* `clear-cache` - deletes all records
* `ttl ms` - time to live in milliseconds
* `get` - get cache.
  * `get *` - get all records
  * `get key` - get cache by key
  * `get HTTP_METHOD` - get all cached responses from HTTP_METHOD requests. **Example:** `get POST`
  * `get :ROUTE` - get all cached responses from the specific route. **Example:** `get :/tasks/2`
  * `get HTTP_METHOD:ROUTE` - get a specific cached response
* `set key data ttl` - create a new record with **key** and **data**. **ttl** - time to live for record (optional)
* `help` - get all commands

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Changelog

Project changes are writen in changelog, see the [CHANGELOG.md](CHANGELOG.md).

We use [SemVer](https://semver.org/) for versioning.
For the versions available, see the [tags](https://github.com/stbestichhh/raito-cache/tags) on this repository.
For the versions supported, see the [SECURITY.md](SECURITY.md).

## Authors

- [@stbestichhh](https://www.github.com/stbestichhh)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE)
