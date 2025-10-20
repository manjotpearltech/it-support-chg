# Quick Deploy Checklist

## 🚀 Deploy in 15 Minutes

### Step 1: Get Azure Token (2 min)
```bash
az login
az account get-access-token --resource https://cognitiveservices.azure.com/ --query accessToken -o tsv
```
Copy the token output.

### Step 2: Add GitHub Secrets (5 min)

Go to: **GitHub Repo** → **Settings** → **Secrets and variables** → **Actions**

Click **New repository secret** and add these 4:

| Name | Value |
|------|-------|
| `REACT_APP_AZURE_OPENAI_ENDPOINT` | `https://manjo-mgzmovnn-eastus2.openai.azure.com/` |
| `REACT_APP_AZURE_OPENAI_DEPLOYMENT` | `azcaitsupportopenai-gpt-4o-mini` |
| `REACT_APP_AZURE_OPENAI_API_VERSION` | `2024-02-15-preview` |
| `REACT_APP_AZURE_ACCESS_TOKEN` | Paste your token from Step 1 |

### Step 3: Deploy to Cloudflare Pages (5 min)

1. Go to **Cloudflare Pages**
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repo
4. Build settings:
   - Framework: **React**
   - Build command: **`npm run build`**
   - Build output: **`build`**
5. Add environment variables (same 4 from Step 2)
6. Click **Save and Deploy**

### Step 4: Test (3 min)

1. Visit your Cloudflare Pages URL
2. Type a message in the chat
3. Verify Azure OpenAI responds
4. Check browser console (F12) for errors

## ✅ Done!

Your app is now live in production with no backend server!

---

## 🔧 Local Development

```bash
cp .env.example .env
# Edit .env with your values
npm install
npm start
```

## 📚 Full Guides

- `GITHUB_SECRETS_SETUP.md` - Detailed GitHub Secrets setup
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_SUMMARY.md` - What changed and why

## ⚠️ Important Notes

- ✅ No backend server needed
- ✅ Secrets stored in GitHub (not in code)
- ✅ Token expires after 1 hour (get new one if needed)
- ✅ Build size: ~163 KB (gzipped)
- ✅ Automatic deployment on every push

## 🆘 Troubleshooting

**"Azure access token not configured"**
→ Add `REACT_APP_AZURE_ACCESS_TOKEN` to GitHub Secrets

**"Azure API error: 401"**
→ Token expired. Get new one and update GitHub Secret

**Build fails**
→ Check GitHub Actions logs. Verify all 4 secrets are set.

---

**Questions?** Check the full guides above!

