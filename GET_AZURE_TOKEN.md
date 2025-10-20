# How to Get Azure Access Token

## Option 1: Using Azure Cloud Shell (Easiest - No Installation Needed)

### Step 1: Open Azure Cloud Shell
1. Go to [Azure Portal](https://portal.azure.com)
2. Click the **Cloud Shell** icon (>_) in the top navigation bar
3. Select **Bash** when prompted

### Step 2: Get Access Token
Run this command in Cloud Shell:
```bash
az account get-access-token --resource https://cognitiveservices.azure.com/ --query accessToken -o tsv
```

### Step 3: Copy the Token
- The command will output a long string (your access token)
- Copy the entire token
- It looks like: `eyJ0eXAiOiJKV1QiLCJhbGc...` (very long)

### Step 4: Add to .env File
1. Open `.env` file in your project
2. Find the line: `REACT_APP_AZURE_ACCESS_TOKEN=`
3. Paste your token after the `=`
4. Save the file

Example:
```env
REACT_APP_AZURE_ACCESS_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik...
```

### Step 5: Restart Your App
```bash
# Stop the app (Ctrl+C)
# Start it again
npm start
```

---

## Option 2: Install Azure CLI Locally

### For macOS:
```bash
brew install azure-cli
```

### For Windows:
Download from: https://aka.ms/installazurecliwindows

### For Linux:
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### After Installation:
```bash
# Login to Azure
az login

# Get access token
az account get-access-token --resource https://cognitiveservices.azure.com/ --query accessToken -o tsv
```

---

## Option 3: Use API Key Instead (Alternative)

If you prefer to use an API key instead of access token, you can modify the service to use API key authentication.

### Get API Key from Azure Portal:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your **Azure OpenAI** resource
3. Click **Keys and Endpoint** in the left menu
4. Copy **KEY 1** or **KEY 2**

### Then I can help you modify the code to use API key instead of Bearer token.

---

## Quick Start (Recommended)

**Use Azure Cloud Shell - it's the fastest way!**

1. Open https://portal.azure.com
2. Click the **>_** icon (Cloud Shell) at the top
3. Run: `az account get-access-token --resource https://cognitiveservices.azure.com/ --query accessToken -o tsv`
4. Copy the output
5. Paste it in `.env` file after `REACT_APP_AZURE_ACCESS_TOKEN=`
6. Restart your app

---

## Important Notes

⚠️ **Access tokens expire after 1 hour**
- You'll need to get a new token every hour for local development
- For production, GitHub Secrets will handle this automatically

💡 **Alternative: Use API Key**
- API keys don't expire
- Easier for local development
- Let me know if you want to switch to API key authentication

---

## Troubleshooting

**"Azure access token not configured"**
- Make sure you pasted the token in `.env` file
- Make sure there's no space after `=`
- Make sure the token is on the same line

**Token expired**
- Get a new token using the same command
- Update `.env` file with the new token
- Restart the app

---

## Need Help?

Let me know if you:
1. Want to use API key instead (easier for local dev)
2. Need help with any of these steps
3. Encounter any errors

