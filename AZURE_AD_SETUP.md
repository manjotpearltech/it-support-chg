# Azure AD SSO Setup Guide

This guide will walk you through setting up Azure AD Single Sign-On (SSO) for the IT Support Chatbot.

## Prerequisites

- Azure subscription with admin access
- Azure AD tenant
- Existing IT Support Chatbot application

## Step 1: Register Application in Azure AD

### 1.1 Navigate to Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Azure Active Directory" or "Microsoft Entra ID"
3. Click on **App registrations** in the left sidebar
4. Click **+ New registration**

### 1.2 Configure App Registration

Fill in the following details:

- **Name**: `IT Support Chatbot` (or your preferred name)
- **Supported account types**: 
  - Select "Accounts in this organizational directory only (Single tenant)"
- **Redirect URI**:
  - Platform: **Web**
  - URI: `http://localhost:3000/api/auth/callback/azure-ad` (for development)
  
Click **Register**

### 1.3 Note Your Application IDs

After registration, you'll see the Overview page. **Copy and save** these values:

- **Application (client) ID** → This is your `AZURE_AD_CLIENT_ID`
- **Directory (tenant) ID** → This is your `AZURE_AD_TENANT_ID`

## Step 2: Create Client Secret

### 2.1 Generate Secret

1. In your app registration, click **Certificates & secrets** in the left sidebar
2. Click **+ New client secret**
3. Add a description: `IT Support Chatbot Secret`
4. Choose expiration: **24 months** (recommended) or custom
5. Click **Add**

### 2.2 Copy Secret Value

**IMPORTANT**: Copy the **Value** immediately (not the Secret ID). This is your `AZURE_AD_CLIENT_SECRET`.

⚠️ **You won't be able to see this value again!** If you lose it, you'll need to create a new secret.

## Step 3: Configure API Permissions

### 3.1 Add Permissions

1. Click **API permissions** in the left sidebar
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `openid` (should already be there)
   - `profile` (should already be there)
   - `email` (should already be there)
   - `User.Read` - Read user profile

6. Click **Add permissions**

### 3.2 Grant Admin Consent (Optional but Recommended)

1. Click **Grant admin consent for [Your Organization]**
2. Click **Yes** to confirm

This prevents users from seeing a consent screen on first login.

## Step 4: Configure Redirect URIs for Production

### 4.1 Add Production URL

1. Click **Authentication** in the left sidebar
2. Under **Web** → **Redirect URIs**, click **+ Add URI**
3. Add your production URL:
   - `https://your-domain.com/api/auth/callback/azure-ad`
4. Click **Save**

### 4.2 Configure Logout URL (Optional)

1. Under **Front-channel logout URL**, add:
   - `https://your-domain.com/auth/signin`
2. Click **Save**

## Step 5: Configure Environment Variables

### 5.1 Update .env.local

Add these variables to your `.env.local` file:

```env
# Azure AD Authentication
AZURE_AD_CLIENT_ID=your-application-client-id-from-step-1
AZURE_AD_CLIENT_SECRET=your-client-secret-from-step-2
AZURE_AD_TENANT_ID=your-directory-tenant-id-from-step-1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-this-with-command-below
```

### 5.2 Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## Step 6: Test the Integration

### 6.1 Start Development Server

```bash
npm run dev
```

### 6.2 Test Sign In

1. Open http://localhost:3000
2. You should be redirected to `/auth/signin`
3. Click "Sign in with Microsoft"
4. You'll be redirected to Microsoft login
5. Sign in with your work account
6. Grant permissions if prompted
7. You should be redirected back to the chatbot

### 6.3 Verify User Info

After signing in, you should see:
- Your profile picture (if available)
- Your name
- Your email address
- A sign-out button

## Step 7: Production Deployment

### 7.1 Update Environment Variables

For production, update these in your hosting platform (Vercel, Azure, etc.):

```env
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-production-secret-different-from-dev
```

### 7.2 Verify Redirect URIs

Make sure your production redirect URI is added in Azure AD:
- `https://your-domain.com/api/auth/callback/azure-ad`

## Troubleshooting

### Error: "AADSTS50011: The redirect URI specified in the request does not match"

**Solution**: 
- Check that the redirect URI in Azure AD exactly matches your app's URL
- Format: `http://localhost:3000/api/auth/callback/azure-ad` (no trailing slash)

### Error: "AADSTS700016: Application not found in the directory"

**Solution**:
- Verify `AZURE_AD_CLIENT_ID` is correct
- Verify `AZURE_AD_TENANT_ID` is correct
- Make sure you're using the right Azure AD tenant

### Error: "Invalid client secret"

**Solution**:
- The client secret may have expired
- Generate a new client secret in Azure AD
- Update `AZURE_AD_CLIENT_SECRET` in your environment variables

### Users see consent screen every time

**Solution**:
- Grant admin consent in Azure AD (Step 3.2)
- This requires admin privileges

### Sign out doesn't work properly

**Solution**:
- Clear browser cookies
- Make sure `NEXTAUTH_URL` is set correctly
- Check that logout URL is configured in Azure AD

## Security Best Practices

1. **Rotate Secrets Regularly**: Set client secret expiration and rotate before expiry
2. **Use Different Secrets**: Use different `NEXTAUTH_SECRET` for dev and production
3. **Restrict Access**: Configure Azure AD conditional access policies if needed
4. **Monitor Sign-ins**: Use Azure AD sign-in logs to monitor authentication activity
5. **Enable MFA**: Require multi-factor authentication for added security

## Optional: Advanced Configuration

### Restrict to Specific Users/Groups

1. In Azure AD, go to your app registration
2. Click **Enterprise applications** → Find your app
3. Click **Properties**
4. Set **User assignment required?** to **Yes**
5. Click **Users and groups** → **+ Add user/group**
6. Assign specific users or groups

### Add Custom Claims

You can request additional user information by modifying the scope in `src/lib/auth.ts`:

```typescript
authorization: {
  params: {
    scope: "openid profile email User.Read Group.Read.All",
  },
},
```

### Session Timeout

Adjust session duration in `src/lib/auth.ts`:

```typescript
session: {
  strategy: "jwt",
  maxAge: 8 * 60 * 60, // 8 hours instead of 30 days
},
```

## Support

For issues with Azure AD setup:
- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [NextAuth.js Azure AD Provider](https://next-auth.js.org/providers/azure-ad)

For application-specific issues:
- Contact your IT support team
- Email: helpdesk@pearltechnologies.com

