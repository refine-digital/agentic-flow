# GitHub Secrets Setup for Automated Docker Publishing

## Required Secrets

To enable automated Docker Hub publishing via GitHub Actions, you need to add the following secrets to your GitHub repository:

### Navigate to Secrets

1. Go to your repository: https://github.com/ruvnet/agentic-flow
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Add These Secrets

#### 1. DOCKERHUB_USERNAME
- **Name**: `DOCKERHUB_USERNAME`
- **Value**: `ruvnet`
- **Description**: Your Docker Hub username

#### 2. DOCKERHUB_TOKEN
- **Name**: `DOCKERHUB_TOKEN`
- **Value**: `dckr_pat_YOUR_DOCKER_HUB_TOKEN_HERE`
- **Description**: Your Docker Hub personal access token

#### 3. ANTHROPIC_API_KEY (for CI tests)
- **Name**: `ANTHROPIC_API_KEY`
- **Value**: Your Anthropic API key from `.env`
- **Description**: Used for integration testing in CI/CD

#### 4. OPENROUTER_API_KEY (optional, for CI tests)
- **Name**: `OPENROUTER_API_KEY`
- **Value**: Your OpenRouter API key from `.env`
- **Description**: Alternative API for integration testing

## Quick Setup Commands

### Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh
# Linux: https://github.com/cli/cli#installation

# Login to GitHub
gh auth login

# Add secrets
gh secret set DOCKERHUB_USERNAME -b "ruvnet"
gh secret set DOCKERHUB_TOKEN -b "dckr_pat_YOUR_DOCKER_HUB_TOKEN_HERE"
gh secret set ANTHROPIC_API_KEY -b "$(grep ANTHROPIC_API_KEY .env | cut -d '=' -f2)"
gh secret set OPENROUTER_API_KEY -b "$(grep OPENROUTER_API_KEY .env | cut -d '=' -f2)"

# Verify secrets are set
gh secret list
```

### Using Web Interface

1. **DOCKERHUB_USERNAME**:
   - Click "New repository secret"
   - Name: `DOCKERHUB_USERNAME`
   - Secret: `ruvnet`
   - Click "Add secret"

2. **DOCKERHUB_TOKEN**:
   - Click "New repository secret"
   - Name: `DOCKERHUB_TOKEN`
   - Secret: `dckr_pat_YOUR_DOCKER_HUB_TOKEN_HERE`
   - Click "Add secret"

3. **ANTHROPIC_API_KEY**:
   - Click "New repository secret"
   - Name: `ANTHROPIC_API_KEY`
   - Secret: (copy from your `.env` file)
   - Click "Add secret"

4. **OPENROUTER_API_KEY** (optional):
   - Click "New repository secret"
   - Name: `OPENROUTER_API_KEY`
   - Secret: (copy from your `.env` file)
   - Click "Add secret"

## Verify Setup

After adding secrets, verify they're configured:

```bash
# List repository secrets
gh secret list

# Expected output:
# ANTHROPIC_API_KEY    Updated 2025-12-07
# DOCKERHUB_TOKEN      Updated 2025-12-07
# DOCKERHUB_USERNAME   Updated 2025-12-07
# OPENROUTER_API_KEY   Updated 2025-12-07
```

## Trigger Automated Build

Once secrets are configured, the GitHub Actions workflow will automatically:

1. **On push to main**:
   - Build all 4 Docker images
   - Run security scans
   - Execute integration tests
   - Push to Docker Hub
   - Update Docker Hub descriptions

2. **On tag creation**:
   ```bash
   git tag -a v2.0.1-alpha -m "Release v2.0.1-alpha"
   git push origin v2.0.1-alpha
   ```

3. **Manual trigger**:
   - Go to Actions tab → Docker Build and Publish
   - Click "Run workflow"
   - Select branch
   - Click "Run workflow"

## Workflow Status

Monitor workflow execution:

```bash
# View workflow runs
gh run list --workflow=docker-publish.yml

# Watch latest run
gh run watch

# View logs
gh run view --log
```

## Security Notes

⚠️ **Important Security Practices**:

1. **Never commit secrets to Git**
2. **Use GitHub Secrets** for sensitive data
3. **Rotate tokens regularly** (every 90 days)
4. **Use minimal permissions** for access tokens
5. **Monitor secret usage** in Actions logs

## Docker Hub Token Permissions

Your token (`dckr_pat_YOUR_DOCKER_HUB_TOKEN_HERE`) should have:

- ✅ Read, Write, Delete permissions
- ✅ Access to repositories under `ruvnet/agentic-flow*`
- ⚠️ **Never share this token publicly**

## Regenerate Token (If Compromised)

If your token is compromised:

1. Go to Docker Hub → Account Settings → Security
2. Delete the old token
3. Create new token with same permissions
4. Update GitHub secret with new value:
   ```bash
   gh secret set DOCKERHUB_TOKEN -b "new-token-here"
   ```

## Next Steps

After setting up secrets:

1. ✅ Verify secrets are configured
2. ✅ Push to main branch to trigger workflow
3. ✅ Monitor workflow execution
4. ✅ Verify images on Docker Hub
5. ✅ Update Docker Hub descriptions manually

---

**Last Updated**: 2025-12-07
**Workflow**: `.github/workflows/docker-publish.yml`
