# 🔧 RENDER ENVIRONMENT VARIABLES CONFIGURATION
# Las Tortillas Backend - Complete Setup Guide

## 🚨 CRITICAL ENVIRONMENT VARIABLES (REQUIRED)

### 1. DATABASE_URL (MANDATORY)
```
DATABASE_URL=postgresql://neondb_owner:npg_EYcsdnj5DG8Z@ep-steep-pine-adqiu0t1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
**Source**: Your Neon database connection string from .env.local
**Purpose**: PostgreSQL database connection

### 2. JWT_SECRET (MANDATORY)
```
JWT_SECRET=chave-super-secreta-local-testing-123456789012
```
**Purpose**: JWT token encryption/decryption
**Requirement**: Minimum 32 characters
**Note**: Use a different, more secure secret for production

### 3. NODE_ENV (MANDATORY)
```
NODE_ENV=production
```
**Purpose**: Sets application environment mode
**Value**: Must be "production" for Render

### 4. PORT (MANDATORY)
```
PORT=10000
```
**Purpose**: Server port (Render standard)
**Value**: Must be 10000 for Render

## 🌐 OPTIONAL ENVIRONMENT VARIABLES

### 5. SUPABASE CONFIGURATION (For Image Storage)
```
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```
**Purpose**: Image storage and file management
**Note**: Leave empty if not using image uploads

### 6. CORS_ORIGIN (For Frontend Connection)
```
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```
**Purpose**: Allow frontend to connect to backend
**Note**: Update with your actual frontend URL after deployment

## 📋 STEP-BY-STEP RENDER CONFIGURATION

### Step 1: Access Render Dashboard
1. Go to: https://dashboard.render.com
2. Log in to your account
3. Select your service: "las-tortillas-backend"

### Step 2: Navigate to Environment Variables
1. In your service dashboard, click "Environment" tab
2. Click "Add Environment Variable" for each variable below

### Step 3: Add Required Variables (Copy-Paste Ready)

**Variable 1:**
- Key: `DATABASE_URL`
- Value: `postgresql://neondb_owner:npg_EYcsdnj5DG8Z@ep-steep-pine-adqiu0t1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

**Variable 2:**
- Key: `JWT_SECRET`
- Value: `chave-super-secreta-local-testing-123456789012`

**Variable 3:**
- Key: `NODE_ENV`
- Value: `production`

**Variable 4:**
- Key: `PORT`
- Value: `10000`

### Step 4: Optional Variables (Add if needed)

**Variable 5 (if using Supabase):**
- Key: `SUPABASE_URL`
- Value: `[Your Supabase URL]`

**Variable 6 (if using Supabase):**
- Key: `SUPABASE_ANON_KEY`
- Value: `[Your Supabase Anon Key]`

**Variable 7 (if using Supabase):**
- Key: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `[Your Supabase Service Role Key]`

**Variable 8 (for frontend CORS):**
- Key: `CORS_ORIGIN`
- Value: `https://your-frontend-domain.vercel.app`

### Step 5: Save and Deploy
1. Click "Save Changes" after adding all variables
2. Render will automatically trigger a new deployment
3. Monitor the deployment logs for any errors

## 🔍 VERIFICATION CHECKLIST

After configuration, verify:
- ✅ All 4 mandatory variables are set
- ✅ DATABASE_URL matches your Neon connection string
- ✅ JWT_SECRET is at least 32 characters
- ✅ NODE_ENV is set to "production"
- ✅ PORT is set to "10000"

## 🚨 TROUBLESHOOTING

### Common Issues:
1. **Database Connection Fails**: Check DATABASE_URL format
2. **JWT Errors**: Ensure JWT_SECRET is minimum 32 characters
3. **Server Won't Start**: Verify PORT is set to 10000
4. **CORS Errors**: Add/update CORS_ORIGIN with frontend URL

### Health Check URL (After Deployment):
```
https://las-tortillas-backend.onrender.com/api/health
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

## 📞 SUPPORT

If deployment fails:
1. Check Render deployment logs
2. Verify all environment variables are correctly set
3. Ensure your GitHub repository is up to date
4. Test the health endpoint after deployment completes