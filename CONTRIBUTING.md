# Contributing to t2v_near_ai_agent

Thank you for your interest in contributing to t2v_near_ai_agent! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Versioning](#versioning)
- [Release Process](#release-process)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the documentation as needed
3. The PR title should clearly describe the change
4. Link any related issues in the PR description

## Versioning

This project follows [Semantic Versioning (SemVer)](https://semver.org/) for all releases:

- **MAJOR** version increments for incompatible API changes
- **MINOR** version increments for new functionality in a backward-compatible manner
- **PATCH** version increments for backward-compatible bug fixes

Version numbers follow the format: `vMAJOR.MINOR.PATCH` (e.g., `v1.2.3`).

### Triggering Version Increments

You can specify the type of version increment in your commit message when merging to the main branch by including one of the following tags:

- `[release:major]`: For breaking changes (e.g., `git commit -m "Complete redesign of API structure [release:major]"`)
- `[release:minor]`: For new features (e.g., `git commit -m "Add new notification features [release:minor]"`)
- `[release:patch]`: For bug fixes (e.g., `git commit -m "Fix authentication timeout issue [release:patch]"`)

If no tag is specified, the default increment will be `patch`.

### Custom Release Notes

You can provide custom release notes by including a `[notes:...]` tag in your commit message:

```bash
git commit -m "Add important feature [release:minor] [notes:This release includes our new authentication system and UI improvements]"
```

If no custom notes are provided, the system will generate release notes automatically from PR titles and commit messages. If no meaningful notes can be generated, a template will be used in this format:

```markdown
## Release vX.Y.Z

### 🚀 New Features
- 

### 🐛 Bug Fixes
- 

### 🔧 Improvements
- 

### 📝 Documentation
- 

### 🧪 Testing
- 

### 🔄 CI/CD
- 
```

## Release Process

Releases are automatically managed through GitHub Actions:

### Automatic Production Releases

When code is merged to the main branch:

1. A GitHub Action workflow is triggered
2. The workflow determines the new version based on commit tags
3. A new version tag is created automatically
4. Release notes are generated from PR titles and commit messages
5. A GitHub release is published with the generated notes

### Manual Release Tagging

You can also manually trigger a release:

1. Go to the Actions tab in the GitHub repository
2. Select the "Semantic Versioning and Release" workflow
3. Click "Run workflow"
4. Select the release type (major, minor, patch)
5. Choose the branch to release from
6. Click "Run workflow"

The workflow will:
- Determine the new version number
- Create a git tag
- Generate release notes
- Create a GitHub release

## Testing

Make sure to run all tests before submitting a PR:

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd app
npm test
``` 