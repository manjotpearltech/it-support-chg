# GitHub Secrets Setup Guide

## Overview

This application calls Azure OpenAI directly from the frontend (no backend server needed). To deploy to production, you need to add **GitHub Secrets** for your Azure credentials.

## Why GitHub Secrets?

✅ **Security**: Credentials are never exposed in code or Git history  
✅ **Automatic**: GitHub automatically injects secrets into environment variables during build  
✅ **Easy**: Simple to update without redeploying code  
✅ **Production Ready**: Perfect for Cloudflare Pages deployment  

## Step 1: Get Your Azure Access Token

You need an Azure access token for authentication. Get it using the Azure CLI:

```bash
# Install Azure CLI if you haven't already
# macOS: brew install azure-cli
# Windows: choco install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Get access token for Azure Cognitive Services
az account get-access-token --resource https://cognitiveservices.azure.com/ --query accessToken -o tsv
```

This will output a long token string. Copy it - you'll need it in the next step.

## Step 2: Add GitHub Secrets

### Via GitHub Web Interface (Easiest)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### Secret 1: Azure OpenAI Endpoint
- **Name**: `REACT_APP_AZURE_OPENAI_ENDPOINT`
- **Value**: `https://manjo-mgzmovnn-eastus2.openai.azure.com/`

#### Secret 2: Azure OpenAI Deployment
- **Name**: `REACT_APP_AZURE_OPENAI_DEPLOYMENT`
- **Value**: `azcaitsupportopenai-gpt-4o-mini`

#### Secret 3: Azure OpenAI API Version
- **Name**: `REACT_APP_AZURE_OPENAI_API_VERSION`
- **Value**: `2024-02-15-preview`

#### Secret 4: Azure Access Token (MOST IMPORTANT)
- **Name**: `REACT_APP_AZURE_ACCESS_TOKEN`
- **Value**: Paste the token you got from `az account get-access-token`

### Via GitHub CLI (Alternative)

```bash
# Install GitHub CLI: https://cli.github.com/

# Login to GitHub
gh auth login

# Add secrets
gh secret set REACT_APP_AZURE_OPENAI_ENDPOINT --body "https://manjo-mgzmovnn-eastus2.openai.azure.com/"
gh secret set REACT_APP_AZURE_OPENAI_DEPLOYMENT --body "azcaitsupportopenai-gpt-4o-mini"
gh secret set REACT_APP_AZURE_OPENAI_API_VERSION --body "2024-02-15-preview"
gh secret set REACT_APP_AZURE_ACCESS_TOKEN --body "your-token-here"
```

## Step 3: Configure Cloudflare Pages

1. Go to Cloudflare Pages
2. Connect your GitHub repository
3. In **Build settings**, add environment variables:
   - `REACT_APP_AZURE_OPENAI_ENDPOINT`
   - `REACT_APP_AZURE_OPENAI_DEPLOYMENT`
   - `REACT_APP_AZURE_OPENAI_API_VERSION`
   - `REACT_APP_AZURE_ACCESS_TOKEN`

4. Set the values from your GitHub Secrets

## Step 4: Deploy

Push your code to GitHub:

```bash
git add .
git commit -m "Add Azure OpenAI direct integration"
git push origin main
```

GitHub Actions will automatically:
1. Build the React app
2. Inject the secrets as environment variables
3. Deploy to Cloudflare Pages

## Local Development

For local testing, create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your values:

```env
REACT_APP_AZURE_OPENAI_ENDPOINT=https://manjo-mgzmovnn-eastus2.openai.azure.com/
REACT_APP_AZURE_OPENAI_DEPLOYMENT=azcaitsupportopenai-gpt-4o-mini
REACT_APP_AZURE_OPENAI_API_VERSION=2024-02-15-preview
REACT_APP_AZURE_ACCESS_TOKEN=your-token-here
```

Then run:

```bash
npm install
npm start
```

## Security Best Practices

✅ **DO:**
- ✅ Use GitHub Secrets for all credentials
- ✅ Rotate access tokens regularly
- ✅ Use minimal permissions for tokens
- ✅ Keep `.env` in `.gitignore`
- ✅ Review GitHub Actions logs for errors

❌ **DON'T:**
- ❌ Commit `.env` file to Git
- ❌ Paste tokens in code or comments
- ❌ Share tokens in chat or email
- ❌ Use production tokens in development
- ❌ Log sensitive information

## Troubleshooting

### "Azure access token not configured"
- Check that `REACT_APP_AZURE_ACCESS_TOKEN` is set in GitHub Secrets
- Verify the token is not expired (tokens expire after 1 hour)
- Get a new token: `az account get-access-token --resource https://cognitiveservices.azure.com/`

### "Azure API error: 401"
- Token is expired or invalid
- Get a new token and update the GitHub Secret

### "Azure API error: 403"
- Token doesn't have permission to access Azure OpenAI
- Verify your Azure account has access to the OpenAI service

### Build fails in GitHub Actions
- Check GitHub Actions logs for error messages
- Verify all secrets are set correctly
- Ensure secret names match exactly (case-sensitive)

## Updating Secrets

To update a secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click the secret you want to update
3. Click **Update**
4. Enter the new value
5. Click **Update secret**

The next deployment will use the new value.

## Monitoring

Check your deployments:

1. Go to your GitHub repository
2. Click **Actions** tab
3. View build logs and deployment status
4. Check Cloudflare Pages for deployment status

## Support

For issues:
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Check Azure service status
4. Review application console logs in browser (F12)

---

**Status: ✅ Ready for Production**

Your application is now configured for secure production deployment!

