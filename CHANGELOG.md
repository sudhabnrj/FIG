# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-04

### Added
- Comprehensive test framework utilizing Vitest and React Testing Library.
- Playwright E2E smoke testing suite.
- Structured JSON logging utility (`src/lib/logger.ts`) with sensitive data sanitization.
- GitHub Actions CI/CD workflows for build, test, and security vulnerability scanning.
- PWA manifest and caching service worker.
- Release Playbook (`RELEASE_PLAYBOOK.md`) covering rollbacks, disaster recovery, and backups.

### Changed
- Refactored server error handler middleware to integrate structured logger.
- Switched Next.js configuration to enable compression and disable powered-by header.
- Cleaned up database credentials from `.env.example`.
