# Google Authentication Setup Guide

This guide will help you configure Google OAuth authentication for your Polybid application using Supabase.

## Prerequisites

- A Google Cloud Platform (GCP) account
- A Supabase project (cloud or local)
- Access to your Supabase dashboard

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: "Polybid" (or your app name)
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if your app is in testing mode
6. For the OAuth client ID:
   - Application type: **Web application**
   - Name: "Polybid Web Client"
   - Authorized JavaScript origins:
     - For production: `https://yourdomain.com`
     - For local development: `http://localhost:3001` (or your dev port)
     - For Supabase cloud: `https://xthxutsliqptoodkzrcp.supabase.co`
   - Authorized redirect URIs:
     - For production: `https://yourdomain.com`
     - For local development: `http://localhost:3001`
     - For Supabase cloud: `https://xthxutsliqptoodkzrcp.supabase.co/auth/v1/callback`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** (you'll need these in the next step)

## Step 2: Configure Google OAuth in Supabase

### For Supabase Cloud:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and click on it
5. Toggle **Enable Google provider** to ON
6. Enter your Google OAuth credentials:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
7. Click **Save**

### For Local Supabase Development:

1. Open your `supabase/config.toml` file
2. Find the `[auth.external.google]` section
3. Update it with your credentials:

```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id"
secret = "your-google-client-secret"
```

4. Restart your local Supabase instance:
   ```bash
   supabase stop
   supabase start
   ```

## Step 3: Configure Redirect URLs

### For Supabase Cloud:

1. In your Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add your site URL:
   - **Site URL**: Your production URL (e.g., `https://yourdomain.com`)
   - **Redirect URLs**: Add all URLs where users should be redirected after authentication:
     - `https://yourdomain.com`
     - `http://localhost:3001` (for local development)

### For Local Development:

The redirect URL is already configured in `config.toml`:
```toml
[auth]
site_url = "http://127.0.0.1:3001"
additional_redirect_urls = ["https://127.0.0.1:3001"]
```

## Step 4: Test Google Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your authentication page
3. Click the **"Sign in with Google"** button
4. You should be redirected to Google's OAuth consent screen
5. After authorizing, you should be redirected back to your app and signed in

## Troubleshooting

### "redirect_uri_mismatch" Error

This error occurs when the redirect URI in your Google OAuth credentials doesn't match what Supabase is using.

**Solution:**
- Check your Google Cloud Console OAuth credentials
- Ensure the redirect URI includes: `https://your-supabase-project.supabase.co/auth/v1/callback`
- For local development, use: `http://127.0.0.1:54321/auth/v1/callback`

### "Invalid client" Error

This means your Google Client ID or Secret is incorrect.

**Solution:**
- Double-check your credentials in the Supabase dashboard
- Ensure there are no extra spaces when copying/pasting
- Regenerate credentials in Google Cloud Console if needed

### OAuth Consent Screen Issues

If you see warnings about the OAuth consent screen:

**Solution:**
- Complete the OAuth consent screen configuration in Google Cloud Console
- Add your email as a test user if the app is in testing mode
- Publish your app if you want to allow all users (requires verification for sensitive scopes)

### Local Development Issues

If Google auth doesn't work locally:

**Solution:**
- Ensure your `config.toml` has Google OAuth enabled
- Restart Supabase: `supabase stop && supabase start`
- Check that your Google OAuth credentials include `http://localhost:3001` in authorized origins
- Verify the redirect URI in Google Console matches your local setup

## Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for sensitive credentials in production
- Regularly rotate your OAuth credentials
- Use HTTPS in production
- Review and limit OAuth scopes to only what's necessary

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Provider Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)





