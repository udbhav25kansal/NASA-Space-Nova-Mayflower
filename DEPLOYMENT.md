# Deployment Guide

This guide covers deploying Habitat Harmony LS² to various hosting platforms.

---

## 📦 Build Process

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory:

- **index.html**: Main HTML file
- **assets/**: JavaScript bundles and assets
  - `index-[hash].js`: Application code (~68 KB gzipped)
  - `three-[hash].js`: Three.js library (~124 KB gzipped)

**Total Bundle Size**: ~142 KB gzipped (~559 KB uncompressed)

### Preview Build Locally

```bash
npm run preview
```

Serves the production build at `http://localhost:4173` for testing before deployment.

---

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended)

**Free static hosting with custom domain support**

1. **Update `vite.config.js` base path**:
   ```javascript
   export default defineConfig({
     base: '/habitat-harmony-ls2/',  // Replace with your repo name
     // ... rest of config
   });
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / root
   - Save

4. **Access your site**:
   - `https://yourusername.github.io/habitat-harmony-ls2/`

---

### Option 2: Netlify

**One-click deployment with automatic builds**

1. **Via Netlify UI**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Deploy

2. **Via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Custom domain** (optional):
   - Go to Domain settings
   - Add custom domain
   - Configure DNS

---

### Option 3: Vercel

**Optimized for modern web frameworks**

1. **Via Vercel UI**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework Preset: Vite
   - Deploy

2. **Via Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

---

### Option 4: AWS S3 + CloudFront

**Scalable static hosting with CDN**

1. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://habitat-harmony-ls2
   aws s3 website s3://habitat-harmony-ls2 --index-document index.html
   ```

2. **Upload build**:
   ```bash
   npm run build
   aws s3 sync dist/ s3://habitat-harmony-ls2 --delete
   ```

3. **Configure CloudFront**:
   - Create distribution pointing to S3 bucket
   - Set default root object: `index.html`
   - Configure caching and compression

4. **Update bucket policy** for public access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::habitat-harmony-ls2/*"
     }]
   }
   ```

---

### Option 5: Self-Hosted (Nginx)

**Full control over hosting environment**

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Copy to web server**:
   ```bash
   scp -r dist/* user@your-server:/var/www/habitat-harmony/
   ```

3. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name habitat-harmony.example.com;
       root /var/www/habitat-harmony;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

       # Cache static assets
       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable HTTPS** (recommended):
   ```bash
   sudo certbot --nginx -d habitat-harmony.example.com
   ```

---

## ⚙️ Environment Configuration

### Base URL Configuration

For subdirectory deployments, update `vite.config.js`:

```javascript
export default defineConfig({
  base: '/your-subdirectory/',  // e.g., '/habitat-harmony/'
  // ...
});
```

### Asset Path Configuration

All assets use relative paths by default (`base: './'`), which works for:
- Root domain deployments
- GitHub Pages
- Most static hosts

---

## 🔍 Pre-Deployment Checklist

- [ ] Run production build successfully (`npm run build`)
- [ ] Test with preview server (`npm run preview`)
- [ ] Verify all module 3D models load correctly
- [ ] Test drag-and-drop functionality
- [ ] Verify export/import JSON works
- [ ] Check console for errors (F12)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify NASA constraints validation
- [ ] Test mobile responsiveness (if applicable)
- [ ] Update `base` path in `vite.config.js` if needed

---

## 🧪 Testing Production Build

```bash
# Build
npm run build

# Preview locally
npm run preview

# Test checklist:
# 1. Navigate to http://localhost:4173
# 2. Add 3-4 modules from catalog
# 3. Drag modules around
# 4. Rotate modules (R key)
# 5. Delete modules (Delete key)
# 6. Export layout as JSON
# 7. Import layout from JSON
# 8. Check HUD metrics update
# 9. Verify violations show in yellow
# 10. No console errors
```

---

## 📊 Performance Optimization

### Already Implemented

✅ **Code Splitting**: Three.js separated into own chunk
✅ **Minification**: esbuild minifier for fast builds
✅ **Tree Shaking**: Unused code eliminated
✅ **Asset Optimization**: Hashed filenames for caching

### Recommended CDN Headers

```
Cache-Control: public, max-age=31536000, immutable  # For /assets/*
Cache-Control: public, max-age=0, must-revalidate   # For index.html
Content-Encoding: gzip
X-Content-Type-Options: nosniff
```

---

## 🐛 Troubleshooting

### Issue: Blank Page After Deployment

**Solution**: Check `base` path in `vite.config.js`

```javascript
// For root domain
base: './',

// For subdirectory
base: '/habitat-harmony-ls2/',
```

### Issue: 404 on Page Reload

**Solution**: Configure server for SPA routing

**Netlify**: Add `_redirects` file to `public/`:
```
/*    /index.html   200
```

**Vercel**: Add `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: Large Bundle Size Warning

**Expected**: Three.js is ~500KB uncompressed (normal for 3D library)
**Gzipped**: ~124 KB (acceptable)

To reduce further (future):
- Use Three.js ES6 imports instead of full build
- Lazy load module geometries

### Issue: WebGL Not Supported

**Solution**: Display fallback message

Add to `index.html` `<body>` before `#app`:
```html
<noscript>
  <div style="padding:20px">
    This application requires JavaScript and WebGL support.
  </div>
</noscript>
```

---

## 📈 Monitoring

### Recommended Analytics

- **Google Analytics**: User behavior tracking
- **Sentry**: Error monitoring and reporting
- **Lighthouse**: Performance audits

### Performance Metrics to Track

- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.9s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

---

## 🔐 Security Considerations

### Content Security Policy (CSP)

Add to hosting platform headers or `index.html` `<head>`:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;">
```

### HTTPS

✅ **Always use HTTPS** in production
✅ **Free certificates**: Let's Encrypt, Cloudflare, Netlify, Vercel

---

## 📞 Support

For deployment issues:
- Check [GitHub Issues](https://github.com/yourusername/habitat-harmony-ls2/issues)
- Review [Vite deployment docs](https://vitejs.dev/guide/static-deploy.html)
- Contact: your-email@example.com

---

**Last Updated**: 2024-10-05
**Build Tool**: Vite 6.3.6
**Target**: ES2020+
