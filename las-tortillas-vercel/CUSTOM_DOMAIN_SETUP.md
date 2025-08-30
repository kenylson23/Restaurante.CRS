# 🌐 Custom Domain Setup Guide - Las Tortillas

## Overview

This guide will help you configure custom domains for your Las Tortillas restaurant system:
- **Frontend Domain**: `www.lastortilhas.ao` (Vercel)
- **Backend API Domain**: `api.lastortilhas.ao` (Render)

---

## 🎯 Domain Strategy

### Recommended Setup:
```
Frontend: https://www.lastortilhas.ao (Vercel)
Backend:  https://api.lastortilhas.ao (Render)
```

### Alternative Setup:
```
Frontend: https://lastortilhas.ao (Vercel)
Backend:  https://lastortilhas.ao/api (Render with path routing)
```

---

## 🔧 Part 1: Frontend Domain (Vercel)

### Step 1: Purchase Domain
1. **Buy domain** from registrar (e.g., GoDaddy, Namecheap, etc.)
2. **Choose**: `lastortilhas.ao` or similar
3. **Keep** registrar credentials handy

### Step 2: Configure in Vercel
1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your project → Settings → Domains
3. **Add domain**: `www.lastortilhas.ao`
4. **Add domain**: `lastortilhas.ao` (redirect to www)

### Step 3: DNS Configuration
Configure these DNS records at your domain registrar:

```dns
Type    Name    Value                              TTL
A       @       76.76.19.19                        3600
A       www     76.76.19.19                        3600
CNAME   www     cname.vercel-dns.com               3600
```

### Step 4: SSL Certificate
- ✅ **Automatic**: Vercel provides free SSL
- ✅ **No action needed**: Certificate auto-renews

---

## 🖥️ Part 2: Backend Domain (Render)

### Option A: Subdomain Setup (Recommended)

#### Step 1: Configure in Render
1. **Go to**: https://dashboard.render.com
2. **Select**: Your service → Settings → Custom Domains
3. **Add domain**: `api.lastortilhas.ao`

#### Step 2: DNS Configuration
Add this DNS record at your domain registrar:

```dns
Type    Name    Value                              TTL
CNAME   api     your-service.onrender.com          3600
```

#### Step 3: Update Frontend Configuration
Update your frontend environment variables:

```env
VITE_API_URL=https://api.lastortilhas.ao
```

### Option B: Path-based Setup

#### Configure Vercel Rewrites
Add to your `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend.onrender.com/api/$1"
    }
  ]
}
```

---

## 🚀 Quick Setup Commands

### For Windows (PowerShell):
```powershell
# Update frontend API URL
$env:VITE_API_URL = "https://api.lastortilhas.ao"

# Rebuild and redeploy frontend
npm run build
vercel --prod
```

### For Linux/Mac:
```bash
# Update frontend API URL
export VITE_API_URL="https://api.lastortilhas.ao"

# Rebuild and redeploy frontend
npm run build
vercel --prod
```

---

## 📋 DNS Records Summary

### Complete DNS Configuration:
```dns
# Main domain
A       @           76.76.19.19                    3600
A       www         76.76.19.19                    3600
CNAME   www         cname.vercel-dns.com           3600

# API subdomain  
CNAME   api         your-backend.onrender.com      3600

# Email (optional)
MX      @           10 mx.your-email-provider.com  3600

# Security (optional)
TXT     @           "v=spf1 include:_spf.google.com ~all"
```

---

## ✅ Validation Checklist

### Before Going Live:
- [ ] Domain purchased and configured
- [ ] DNS records propagated (check with `nslookup`)
- [ ] SSL certificates active (check browser)
- [ ] Frontend loads at custom domain
- [ ] Backend API responds at custom domain
- [ ] All internal links updated to custom domain
- [ ] Environment variables updated
- [ ] CORS configured for new domain

### Testing Commands:
```powershell
# Test DNS propagation
nslookup www.lastortilhas.ao
nslookup api.lastortilhas.ao

# Test SSL and connectivity
curl -I https://www.lastortilhas.ao
curl -I https://api.lastortilhas.ao/api/health
```

---

## 🔒 Security Considerations

### SSL/HTTPS:
- ✅ **Vercel**: Automatic SSL
- ✅ **Render**: Automatic SSL
- ✅ **Force HTTPS**: Configured in both platforms

### CORS Update:
Update backend CORS configuration:

```env
CORS_ORIGIN=https://www.lastortilhas.ao,https://lastortilhas.ao
```

### Security Headers:
Already configured in `vercel.json`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

---

## 📊 Performance Optimization

### CDN Configuration:
- ✅ **Vercel**: Global CDN included
- ✅ **Render**: Global CDN available

### Caching Headers:
```javascript
// Static assets cache (already configured)
Cache-Control: public, max-age=31536000, immutable

// API responses cache
Cache-Control: public, max-age=300
```

---

## 🛠️ Troubleshooting

### Common Issues:

#### 1. DNS Not Propagating
```bash
# Check DNS propagation globally
https://www.whatsmydns.net/

# Clear local DNS cache (Windows)
ipconfig /flushdns

# Clear local DNS cache (Mac/Linux)
sudo dscacheutil -flushcache
```

#### 2. SSL Certificate Issues
- **Wait**: Can take up to 24 hours
- **Check**: Domain validation emails
- **Verify**: DNS records are correct

#### 3. CORS Errors After Domain Change
- **Update**: Backend CORS_ORIGIN environment variable
- **Restart**: Backend service
- **Clear**: Browser cache

#### 4. API Calls Failing
- **Check**: VITE_API_URL in frontend
- **Verify**: Backend custom domain working
- **Test**: Direct API calls with curl

---

## 📞 Support Resources

### Documentation:
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Render Custom Domains](https://render.com/docs/custom-domains)

### Tools:
- [DNS Checker](https://www.whatsmydns.net/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)
- [CORS Tester](https://cors-test.codehappy.dev/)

---

## 🎯 Final Steps

### After Domain Setup:
1. **Update** all documentation with new URLs
2. **Test** all functionality end-to-end
3. **Monitor** logs for any issues
4. **Update** any hardcoded URLs in code
5. **Configure** analytics for new domain
6. **Set up** monitoring alerts

### Go Live Checklist:
- [ ] Custom domains configured and working
- [ ] SSL certificates active
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] Team trained on new URLs
- [ ] Documentation updated

**🎉 Your restaurant system is now live on your custom domain!**