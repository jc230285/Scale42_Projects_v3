# Scale42 Projects - Coolify Deployment Guide

## Deployment URLs
- **Production**: https://s42_v3.edbmotte.com/
- **Dev**: https://beta.s42_v3.edbmotte.com/
- **Coolify Dashboard**: https://coolify.edbmotte.com/
- **Project URL**: https://coolify.edbmotte.com/project/s44wokggcck4wws84w4s8kow/environment/p0oggsscw8gs0gscwcocws4g

## Required Environment Variables for Coolify

Copy these **exact** values into your Coolify application environment variables:

### Supabase Configuration (Use values from .env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_from_env_local
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_from_env_local
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_from_env_local
```

### Google OAuth (Use values from .env.local)
```
GOOGLE_CLIENT_ID=your_google_client_id_from_env_local
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_env_local
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_from_env_local
```

### Database Connection (Use values from .env.local)
```
SUPABASE_DB_HOST=your_db_host_from_env_local
SUPABASE_DB_PORT=5432
SUPABASE_DB_DATABASE=postgres
SUPABASE_DB_USER=your_db_user_from_env_local
SUPABASE_DB_PASSWORD=your_db_password_from_env_local
```

### NextAuth Configuration
**Production:**
```
NEXTAUTH_URL=https://s42_v3.edbmotte.com
NEXTAUTH_SECRET=3b1bbe07a07606c32850e8555ff15831
```

**Dev:**
```
NEXTAUTH_URL=https://beta.s42_v3.edbmotte.com
NEXTAUTH_SECRET=3b1bbe07a07606c32850e8555ff15831
```

## Deployment Steps

### 1. Production Deployment (s42_v3.edbmotte.com)
1. Go to: https://coolify.edbmotte.com/project/s44wokggcck4wws84w4s8kow/environment/p0oggsscw8gs0gscwcocws4g
2. Create new application
3. Set repository: `jc230285/Scale42_Projects_v3`
4. Set branch: `master`
5. Set build pack: `Docker Compose`
6. Set compose file: `docker-compose.yml`
7. Add all environment variables above (use production NEXTAUTH_URL)
8. Set domain: `s42_v3.edbmotte.com`
9. Deploy

### 2. Dev Deployment (beta.s42_v3.edbmotte.com)
1. Create another application
2. Same settings but:
   - Set domain: `beta.s42_v3.edbmotte.com`
   - Use dev NEXTAUTH_URL in environment variables

## Troubleshooting

### If you don't see the frontend/backend:

1. **Check Application Logs**:
   - Go to your Coolify application
   - Click on "Logs" tab
   - Look for build errors or runtime errors

2. **Verify Health Check**:
   - Try accessing: `https://s42_v3.edbmotte.com/api/health`
   - Should return: `{"status": "healthy", ...}`

3. **Check Build Status**:
   - Ensure the Docker build completed successfully
   - No npm install or build errors

4. **Port Configuration**:
   - Ensure Coolify is mapping port 3000 correctly
   - Check if the container is running

### Common Issues:
- **Build fails**: Check Node.js version compatibility
- **App doesn't start**: Check environment variables
- **Can't connect to DB**: Verify Supabase credentials
- **OAuth not working**: Update Google OAuth settings with new domains

## Next Steps After Deployment
1. Update Google OAuth settings to include your domains
2. Update Supabase Auth settings to include your domains
3. Run database migrations in Supabase if needed