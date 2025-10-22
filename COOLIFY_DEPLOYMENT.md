# Coolify Deployment Configuration for Scale42 Projects

## Environment Variables Required

Copy these environment variables to your Coolify application configuration:

### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Google OAuth
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Database Connection (for Python scripts)
```env
SUPABASE_DB_HOST=aws-0-your-region.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_DATABASE=postgres
SUPABASE_DB_USER=postgres.your-project-id
SUPABASE_DB_PASSWORD=your-db-password
```

### NextAuth Configuration
```env
NEXTAUTH_URL=https://your-coolify-domain.com
NEXTAUTH_SECRET=your-32-character-random-secret
```

## Coolify Deployment Steps

1. **Connect Repository**: Add your Git repository to Coolify
2. **Set Build Configuration**:
   - Build Command: `npm run build`
   - Dockerfile: Use `Dockerfile.prod`
   - Port: `3000`
3. **Environment Variables**: Add all the above variables
4. **Domain**: Configure your domain/subdomain
5. **Deploy**: Click deploy!

## Health Check
- **Endpoint**: `/api/health`
- **Expected Response**: `{"status": "healthy", ...}`

## Database Setup
After deployment, you'll need to run the SQL migrations in your Supabase project:
1. `sql/001_s42_schema.sql`
2. `sql/002_s42_rls_policies.sql`
3. Other migration files as needed

## Notes
- The application uses fallback navigation when database tables don't exist
- Google OAuth must be configured in Google Cloud Console with your Coolify domain
- Supabase Auth providers must be configured with your Coolify domain