# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Added:
* Password protection

## 1.0.0
### Added:
* WebSocket server
* **--http** option to start http proxy server. Only websocket starts by default
* Deployed docker image. See [README.md](README.md#deployment) for the instructions

### Updated: 
* **start** and **stop** commands updated. Now it can be chosen which one server to start or stop

### Fixed:
* Provided fixes for **get** and **set** commands

## Patch 0.0.2
### Added:
* New command **origin** for setting new url for caching responses

### Updated: 
* Option **origin** is not required now to start the server

### Fixed:
* If not existing key to clear-cache command passed, it was clearing all cache records

**Full changelog till v0.0.1** is [here](https://github.com/stbestichhh/raito-cache/tree/3f5c6bc8ebb7e7676f328ca5e9ee65b8af8f6614)
