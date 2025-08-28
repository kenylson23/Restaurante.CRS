# Deploy Instructions

## Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`
3. Use the vercel.json configuration (already configured)
4. Deploy automatically

## Backend (Render)
1. Create a new Web Service on Render
2. Connect your repository
3. Set:
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Environment: Node
4. Add environment variables:
   - `DATABASE_URL` (from your Neon database)
   - `NODE_ENV=production`
   - `FRONTEND_URL` (your Vercel URL)

## Database (Neon)
- Already configured: `postgresql://neondb_owner:npg_EYcsdnj5DG8Z@ep-steep-pine-adqiu0t1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
- Tables already migrated

## Current Status
✅ Backend structure separated
✅ Frontend configuration updated
✅ Database migrated and ready
✅ CORS configured for cross-origin requests

## Next Steps
1. Deploy backend to Render first
2. Get the Render URL and update VITE_API_URL in Vercel
3. Deploy frontend to Vercel
4. Test the full application