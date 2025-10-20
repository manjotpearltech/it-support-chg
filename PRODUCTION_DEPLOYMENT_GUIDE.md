# Production Deployment Guide

## Overview

Your IT Support Chat application is now ready for production deployment. It calls Azure OpenAI directly from the frontend with **no backend server needed**.

### Architecture

```
Frontend (React) → Azure OpenAI
                ↓
            Direct API Call
                ↓
        Bearer Token Auth
```

**Benefits:**
- ✅ No backend server to maintain
- ✅ Scales automatically with Cloudflare Pages
- ✅ Lower costs
- ✅ Faster deployment
- ✅ Secure token-based authentication

## Prerequisites

Before deploying, you need:

1. ✅ GitHub account with your repository
2. ✅ Cloudflare account
3. ✅ Azure account with OpenAI service
4. ✅ Azure CLI installed (`az` command)

## Step 1: Get Azure Access Token

```bash
# Login to Azure
az login

# Get access token
az account get-access-token --resource https://cognitiveservices.azure.com/ --query accessToken -o tsv
```

Copy the token - you'll need it in the next step.

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these 4 secrets:

| Name | Value |
|------|-------|
| `REACT_APP_AZURE_OPENAI_ENDPOINT` | `https://manjo-mgzmovnn-eastus2.openai.azure.com/` |
| `REACT_APP_AZURE_OPENAI_DEPLOYMENT` | `azcaitsupportopenai-gpt-4o-mini` |
| `REACT_APP_AZURE_OPENAI_API_VERSION` | `2024-02-15-preview` |
| `REACT_APP_AZURE_ACCESS_TOKEN` | Your token from Step 1 |

## Step 3: Deploy to Cloudflare Pages

### Option A: Connect GitHub (Recommended)

1. Go to Cloudflare Pages
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Configure build settings:
   - **Framework preset**: React
   - **Build command**: `npm run build`
   - **Build output directory**: `build`

5. Add environment variables:
   - `REACT_APP_AZURE_OPENAI_ENDPOINT`
   - `REACT_APP_AZURE_OPENAI_DEPLOYMENT`
   - `REACT_APP_AZURE_OPENAI_API_VERSION`
   - `REACT_APP_AZURE_ACCESS_TOKEN`

6. Click **Save and Deploy**

### Option B: Manual Deployment

```bash
# Build locally
npm run build

# Install Wrangler (Cloudflare CLI)
npm install -g wrangler

# Deploy
wrangler pages deploy build
```

## Step 4: Verify Deployment

1. Go to your Cloudflare Pages deployment URL
2. Test the chat functionality
3. Check browser console (F12) for any errors
4. Verify Azure OpenAI is responding

## Local Development

For local testing:

```bash
# Create .env file
cp .env.example .env

# Add your values
REACT_APP_AZURE_OPENAI_ENDPOINT=https://manjo-mgzmovnn-eastus2.openai.azure.com/
REACT_APP_AZURE_OPENAI_DEPLOYMENT=azcaitsupportopenai-gpt-4o-mini
REACT_APP_AZURE_OPENAI_API_VERSION=2024-02-15-preview
REACT_APP_AZURE_ACCESS_TOKEN=your-token-here

# Start development server
npm install
npm start
```

## Continuous Deployment

Every time you push to GitHub:

1. GitHub Actions automatically builds your app
2. Injects secrets as environment variables
3. Deploys to Cloudflare Pages
4. Your app is live in seconds

## Monitoring & Troubleshooting

### Check Deployment Status
- GitHub: **Actions** tab
- Cloudflare: **Pages** → **Deployments**

### Common Issues

**"Azure access token not configured"**
- Verify `REACT_APP_AZURE_ACCESS_TOKEN` is set in GitHub Secrets
- Token expires after 1 hour - get a new one if needed

**"Azure API error: 401"**
- Token is expired or invalid
- Get a new token: `az account get-access-token --resource https://cognitiveservices.azure.com/`
- Update the GitHub Secret

**"Azure API error: 403"**
- Your Azure account doesn't have permission
- Verify you have access to the OpenAI service

**Build fails in GitHub Actions**
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure secret names match exactly (case-sensitive)

## Security Checklist

✅ **Before Going Live:**
- [ ] All secrets added to GitHub
- [ ] `.env` file in `.gitignore`
- [ ] No credentials in code
- [ ] HTTPS enabled on Cloudflare
- [ ] Access token has minimal permissions
- [ ] Tested locally and in staging

✅ **Ongoing:**
- [ ] Monitor Azure usage and costs
- [ ] Rotate access tokens regularly (monthly)
- [ ] Review GitHub Actions logs
- [ ] Check Cloudflare analytics
- [ ] Update dependencies regularly

## Updating Secrets

To update a secret (e.g., new access token):

1. Go to GitHub **Settings** → **Secrets and variables** → **Actions**
2. Click the secret to update
3. Click **Update**
4. Enter new value
5. Click **Update secret**

Next deployment will use the new value.

## Rollback

If something goes wrong:

1. Go to Cloudflare Pages → **Deployments**
2. Find the previous working deployment
3. Click **Rollback to this deployment**

Your app will revert to the previous version instantly.

## Performance

Current build size:
- **JavaScript**: 158.72 kB (gzipped)
- **CSS**: 4.86 kB (gzipped)
- **Total**: ~163 kB

Cloudflare Pages automatically:
- ✅ Compresses files
- ✅ Caches globally
- ✅ Serves from edge locations
- ✅ Provides DDoS protection

## Cost Estimation

**Cloudflare Pages**: Free tier includes:
- ✅ Unlimited deployments
- ✅ Unlimited requests
- ✅ Global CDN
- ✅ Free SSL/TLS

**Azure OpenAI**: Pay per token used
- Varies based on model and usage
- Monitor in Azure Portal

## Support

For issues:
1. Check `GITHUB_SECRETS_SETUP.md`
2. Review GitHub Actions logs
3. Check Cloudflare Pages logs
4. Verify Azure service status
5. Check browser console (F12)

---

**Status: ✅ Ready for Production**

Your application is now configured for secure, scalable production deployment!

