# CI/CD Configuration

This directory contains GitHub Actions workflows and configuration for the TS-ACL project.

## 🚀 Workflows

### `ci-cd.yml` - Main CI/CD Pipeline
Triggered on: Push to `main`/`develop`, Pull Requests

**Jobs:**
- **🔍 Lint & Format** - ESLint, TypeScript checking, commit message validation
- **🧪 Test** - Unit tests across Node.js versions (18, 20, 22)
- **🏗️ Build** - TypeScript compilation and artifact upload
- **🔒 Security Audit** - Dependency vulnerability scanning
- **🚀 Release** - Automated semantic releases (main branch only)
- **🚀 Pre-release** - Beta releases from develop branch

### `label-pr.yml` - Automatic PR Labeling
Triggered on: PR events (opened, synchronize, reopened, edited)

**Features:**
- Auto-labels PRs based on changed files
- Adds size labels based on lines changed
- Helps with PR organization and review process

## 🏷️ Labels

Automatic labels based on file changes:
- `documentation` - Changes to docs, README files
- `core` - Changes to source code
- `tests` - Changes to test files
- `config` - Configuration file changes
- `ci` - GitHub Actions changes
- `dependencies` - Package.json changes
- `build` - Build system changes

Size labels: `XS`, `S`, `M`, `L`, `XL`, `XXL`

## 🔐 Required Secrets

For the workflows to function properly, configure these secrets in your repository:

### GitHub Repository Secrets
- `GITHUB_TOKEN` - Automatically provided by GitHub
- `NPM_TOKEN` - For publishing to npm registry (optional if not publishing)

### Setting up NPM_TOKEN
1. Create an npm access token: `npm token create`
2. Add it to GitHub repository secrets as `NPM_TOKEN`

## 📝 Commit Convention

This project uses [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:
- `feat` - New feature (minor release)
- `fix` - Bug fix (patch release)
- `docs` - Documentation changes
- `style` - Code formatting (no logic changes)
- `refactor` - Code refactoring (patch release)
- `perf` - Performance improvements (patch release)
- `test` - Test changes
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Revert previous commit (patch release)

### Examples:
```bash
feat(core): add role hierarchy support
fix(auth): resolve permission check race condition
docs: update installation guide
chore(deps): update typescript to 5.2.0
```

## 🔄 Release Process

### Automatic Releases
- **Main branch**: Production releases (1.0.0, 1.1.0, etc.)
- **Develop branch**: Pre-releases (1.0.0-beta.1, etc.)

### Release Types
- Breaking changes → Major version (1.0.0 → 2.0.0)
- New features → Minor version (1.0.0 → 1.1.0)
- Bug fixes → Patch version (1.0.0 → 1.0.1)

### Manual Release
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Run semantic release
npm run semantic-release
```

## 🧪 Local Development

### Pre-commit Hooks
Husky is configured to run checks before commits:
- ESLint validation
- TypeScript type checking
- Commit message validation (commitlint)

### Running Checks Locally
```bash
# Lint code
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Run tests
npm test
npm run test:coverage

# Build project
npm run build

# Validate commit message
echo "feat: add new feature" | npx commitlint
```

## 🔧 Troubleshooting

### Common Issues

**Commit message validation fails:**
- Ensure your commit message follows conventional commit format
- Use `git commit --amend` to fix the message

**Tests failing in CI but passing locally:**
- Check Node.js version compatibility
- Ensure all dependencies are properly listed in package.json

**Release not triggered:**
- Verify commit message format
- Check that you're pushing to the main branch
- Ensure GitHub token has proper permissions

**NPM publish fails:**
- Verify NPM_TOKEN is set correctly
- Check package.json configuration
- Ensure you have publish permissions for the package

### Getting Help
- Check workflow logs in GitHub Actions tab
- Review failed jobs for specific error messages
- Ensure all required secrets are configured
