# Deployment Guide for Chat Room with Durable Objects

## The Issue

The deployment is failing because **Durable Objects with migrations require `wrangler deploy`** for the initial deployment, but the platform is using `wrangler versions upload`.

Error: `"migrations must be fully applied by running 'wrangler deploy'"`

## Solutions

### Option 1: Manual Deployment (Recommended)

Deploy manually using the correct command:

```bash
# 1. Clone the repository locally
git clone <your-repo-url>
cd <your-repo-name>

# 2. Install dependencies
npm install

# 3. Build the application
npm run build

# 4. Deploy with migrations
npx wrangler deploy --compatibility-date=2025-04-04

# 5. (Optional) Set up subsequent deployments
npx wrangler versions upload
```

### Option 2: Configure Platform Deployment

If using Cloudflare Pages or similar platform:

1. **Change the deployment command** in your platform settings from:
   ```
   npx wrangler versions upload
   ```
   To:
   ```
   npm run deploy
   ```

2. **Or use the custom deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 3: Two-Phase Deployment

If the platform doesn't support `wrangler deploy`:

1. **First, deploy without migrations** (temporarily comment out the migrations section in `wrangler.jsonc`)
2. **Then run migrations separately**:
   ```bash
   npx wrangler deploy --compatibility-date=2025-04-04
   ```

## After Initial Deployment

Once the migration is applied successfully, subsequent deployments can use:
- `wrangler versions upload` (for gradual deployments)
- `wrangler deploy` (for immediate deployments)

## Verifying Deployment

After successful deployment, test:

1. **Visit your worker URL**
2. **Click "Join Chat Room"**
3. **Enter a username and start chatting**
4. **Test on mobile devices**

## Troubleshooting

### Migration Already Applied Error
If you get "migration already applied", you can safely use:
```bash
npx wrangler versions upload
```

### WebSocket Connection Issues
- Ensure your domain supports WebSocket upgrades
- Check browser console for connection errors
- Verify the Durable Object binding is working

### Storage Issues
- Durable Objects automatically handle storage
- Messages persist across deployments
- Check Cloudflare dashboard for Durable Object logs

## Platform-Specific Instructions

### Cloudflare Pages
1. Go to your Pages project settings
2. Change "Build command" to: `npm run build`
3. Change "Deploy command" to: `npm run deploy`

### GitHub Actions
Add to your workflow:
```yaml
- name: Deploy to Cloudflare Workers
  run: npm run deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Other CI/CD Platforms
Ensure the deployment step runs:
```bash
npm run deploy
```
Instead of calling wrangler directly.

## Success Indicators

✅ **Build completes** without TypeScript errors  
✅ **Migration applies** without conflicts  
✅ **Durable Object binding** is created  
✅ **WebSocket connections** work  
✅ **Messages persist** between sessions  
✅ **Mobile interface** is responsive  

## Need Help?

If you continue to have deployment issues:

1. **Check Cloudflare Workers dashboard** for error logs
2. **Verify your wrangler authentication**: `npx wrangler whoami`
3. **Try local development**: `npm run dev`
4. **Check the browser console** for WebSocket errors

The chat room should work perfectly once the initial migration is applied!