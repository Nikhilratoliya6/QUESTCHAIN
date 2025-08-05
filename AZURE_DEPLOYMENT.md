# Azure Deployment Guide

This guide will help you deploy your QuestChain backend to Azure using GitHub Actions.

## Prerequisites

1. **Azure Account**: You need an active Azure subscription
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Azure Web App**: Create a Web App resource in Azure

## Step 1: Create Azure Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Web App" and select it
4. Configure your Web App:
   - **Resource Group**: Create new or use existing
   - **Name**: `questchain` (or your preferred name)
   - **Runtime Stack**: Node 20 LTS
   - **Operating System**: Linux
   - **Region**: Choose your preferred region
   - **Pricing Plan**: Choose based on your needs (F1 Free tier available)

## Step 2: Configure Environment Variables in Azure

1. In your Azure Web App, go to **Configuration** → **Application settings**
2. Add the following environment variables:

```
MONGO_URI=<your-mongodb-uri-here>
JWT_SECRET=<you-jwt-secret-key-here>
EMAIL_PASSWORD=<email-password-here>
ADMIN_USERNAME=<username>
ADMIN_PASSWORD=<password>
CRON_SECRET_KEY=<cron-secret-key-here>
NODE_ENV=production
PORT=<port-number>
```

**Important**: 
- Set `NODE_ENV=production` for production environment
- Azure typically uses port 8080, but your app should use `process.env.PORT`

## Step 3: Get Azure Publish Profile

1. In your Azure Web App, go to **Overview**
2. Click **Get publish profile** (download button)
3. This downloads a `.publishsettings` file
4. Open the file and copy its entire content

## Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Create the following secret:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: Paste the entire content of the `.publishsettings` file

## Step 5: Update App Name in Workflow (if needed)

In `.github/workflows/azure-deploy.yml`, update the `app-name` if you used a different name:

```yaml
- name: 🌐 Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'your-app-name'  # Change this to your Azure Web App name
    slot-name: 'Production'
    publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
    package: './backend'
```

## Step 6: Deploy

### Automatic Deployment ✅
Your backend will automatically deploy when you:
- Push changes to `main` or `master` branch
- Modify any files in the `backend/` folder

### Manual Deployment
You can also manually trigger deployment:
1. Go to GitHub repository → **Actions** tab
2. Click **questchain** workflow
3. Click **Run workflow** → **Run workflow**

### Deployment Triggers
```yaml
on:
  push:
    branches: [ main, master ]    # Triggers on main/master branch
    paths: [ 'backend/**' ]       # Only when backend files change
  workflow_dispatch:              # Allows manual triggering
```

**Note**: Frontend changes will NOT trigger backend deployment (which is correct!)

1. ~~Commit and push your changes to the `main` or `master` branch~~
2. ~~The GitHub Action will automatically trigger~~
3. Monitor the deployment in the **Actions** tab of your GitHub repository
4. Once complete, your app will be available at: `https://questchain.azurewebsites.net`

## Step 7: Configure CORS (if needed)

If you're getting CORS errors, update your backend's CORS configuration in `server.js`:

```javascript
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://dqdevins.vercel.app', 'https://questchain.pages.dev', 'https://www.devins.social', 'https://devins.social', 'https://questchain.me', 'https://your-frontend-domain.com']
        : ['http://localhost:3000']
}));
```

## Troubleshooting

### Common Issues:

1. **App not starting**: Check the logs in Azure Portal → Monitoring → Log stream
2. **Environment variables**: Ensure all required environment variables are set in Azure
3. **Port issues**: Make sure your app uses `process.env.PORT || 5000`
4. **Database connection**: Verify your MongoDB URI is correct and accessible from Azure

### Checking Logs:

1. Go to Azure Portal → Your Web App
2. Navigate to **Monitoring** → **Log stream**
3. You can see real-time logs here

### Manual Deployment:

If GitHub Actions fail, you can also deploy manually:

1. Zip your backend folder
2. Go to Azure Portal → Your Web App → **Development Tools** → **Advanced Tools**
3. Click **Go** → **Debug console** → **CMD**
4. Navigate to `/site/wwwroot`
5. Drag and drop your zip file
6. Restart your app

## Health Check

After deployment, test your endpoints:

- Health check: `https://questchain.azurewebsites.net/health` ✅ **DEPLOYED**
- API endpoint: `https://questchain.azurewebsites.net/api/auth/signup` ✅ **WORKING**

### Verified Endpoints:
- ✅ Health: Returns "Health Check ---> OKAY✅"
- ✅ Authentication: Properly rejects unauthorized requests
- ✅ API Routes: Signup endpoint returns proper validation errors
- ✅ CORS: Configured for your frontend domains

## Updating Frontend Configuration

✅ **COMPLETED** - Your frontend's `src/config/api.js` is already configured:

```javascript
const API_BASE_URL = "https://questchain.azurewebsites.net/";
export default API_BASE_URL;
```

## Security Notes

- Never commit `.env` files to GitHub
- Use Azure Application Settings for environment variables
- Regularly rotate your JWT secret and other sensitive keys
- Consider using Azure Key Vault for enhanced security

---

Your QuestChain backend should now be successfully deployed to Azure! 🚀
