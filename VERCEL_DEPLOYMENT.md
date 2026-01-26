# Vercel Deployment Guide

## Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click "Add New" -> "Project"
3. Import your GitHub repository
4. Vercel will auto-detect React and configure everything
5. Click "Deploy"

That's it! Your app will be live in ~1 minute.

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
vercel

# Deploy to production
vercel --prod
```

## Configuration

The project includes `vercel.json` with the following settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Automatic Deployments

Once connected to GitHub:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches / Pull Requests

## Environment Variables (Optional)

If you need environment variables:
1. Go to your project in Vercel Dashboard
2. Settings -> Environment Variables
3. Add your variables

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Settings -> Domains
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Build fails?
1. Check build logs in Vercel Dashboard
2. Try running `npm run build` locally first
3. Ensure all dependencies are in `package.json`

### Page not loading?
- The `rewrites` in `vercel.json` handles client-side routing
- All routes redirect to `index.html`

### Need to rebuild?
- Go to Deployments tab
- Click "..." on any deployment
- Select "Redeploy"

## Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Create React App on Vercel](https://vercel.com/guides/deploying-react-with-vercel)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
