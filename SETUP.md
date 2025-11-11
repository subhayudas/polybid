# Setup Instructions for Polybid

## Prerequisites Check

✅ Node.js v23.11.0 - Installed
✅ Supabase CLI - Installed
✅ Docker - Installed (but needs to be started)

## Step-by-Step Setup

### 1. Start Docker Desktop

**IMPORTANT**: Docker Desktop must be running for Supabase local development.

- Open Docker Desktop application on your Mac
- Wait for Docker to fully start (whale icon in menu bar should be steady)
- If Docker Desktop is not installed, download it from: https://www.docker.com/products/docker-desktop/

### 2. Start Local Supabase

Once Docker is running, execute:

```bash
cd /Users/subhayudas/Desktop/polybid
supabase start
```

This will:
- Download and start Supabase Docker containers
- Set up local PostgreSQL database
- Start Supabase Studio (available at http://127.0.0.1:54323)
- Configure API endpoint at http://127.0.0.1:54321

**Note**: First run may take several minutes to download images.

### 3. Run Database Migrations

After Supabase is started:

```bash
supabase db reset
```

This will apply all migrations from `supabase/migrations/` directory.

### 4. Start Development Server

In a new terminal:

```bash
cd /Users/subhayudas/Desktop/polybid
npm run dev
```

The application will be available at: **http://localhost:3001**

## Environment Configuration

The `.env` file has been configured with:
- `VITE_SUPABASE_URL=http://127.0.0.1:54321` (local Supabase)
- `VITE_SUPABASE_ANON_KEY` (default local development key)

## Useful Commands

```bash
# Check Supabase status
supabase status

# Stop Supabase
supabase stop

# View Supabase logs
supabase logs

# Access Supabase Studio (database UI)
# Open: http://127.0.0.1:54323
```

## Troubleshooting

### Docker not running
- Make sure Docker Desktop is installed and running
- Check Docker status: `docker ps`

### Supabase won't start
- Ensure Docker is running: `docker ps`
- Check if ports 54321-54329 are available
- Try: `supabase stop` then `supabase start`

### Database connection errors
- Verify Supabase is running: `supabase status`
- Check `.env` file has correct URL: `http://127.0.0.1:54321`
- Restart Supabase: `supabase stop && supabase start`

## Next Steps

1. Start Docker Desktop
2. Run `supabase start` (wait for it to complete)
3. Run `supabase db reset` (to apply migrations)
4. Run `npm run dev` (in a separate terminal)
5. Open http://localhost:3001 in your browser






