Remix of Remix Spark (v0-p6)

Automatically synced with your v0.app
 project deployments.


🚀 Overview

This project is a full-stack Next.js 14 application powered by v0.app, integrating:

🧠 AI-generated components (via v0.app
)

🤖 Discord Bot Integration — posts progress updates and milestone completions directly from Discord

🧩 GitHub Integration — fetches and syncs project data or issues from repositories

📊 Neon Postgres Database for persistent project and activity tracking

💬 Activity Logs and Project Dashboard automatically reflecting Discord and GitHub actions

All backend APIs (milestones, progress updates, project syncs) are built as server routes under /app/api/..., secured with a service bot token (SERVICE_BOT_TOKEN).

🧩 Integrations
🪄 Discord Integration

The included bot connects to your Discord server and enables:

/progress-update — posts recent updates to linked projects

/milestone-status — marks active milestones as completed

Automatically syncs data to the dashboard and activity log

Configuration:

DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_GUILD_ID=your_server_id
SERVICE_BOT_TOKEN=super-long-secret-token


You can register and test commands with:

npx tsx scripts/discord-commander.ts

🧰 GitHub Integration

Connects to GitHub repositories for each project to:

Sync commits, PRs, or issues as activity logs

Track active development directly in the dashboard

Configuration:

GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret


GitHub events (like push or milestone close) trigger updates in activity_logs via /api/github/webhook.

🧠 Local Development
Prerequisites

Node.js ≥ 20

PostgreSQL (Neon, Supabase, or local Postgres)

A .env.local file with all required tokens and DB URL

Example .env.local:

DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
SERVICE_BOT_TOKEN=super-long-secret-token
DISCORD_BOT_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_GUILD_ID=...
GITHUB_TOKEN=...

🧪 Run All Services at Once

You can launch everything — frontend, cron jobs, and Discord bot — with one command:

npm run dev:all


This runs concurrently:

next dev (frontend)

tsx scripts/scheduler.ts (cron jobs)

tsx scripts/discord-commander.ts (Discord bot registration)

🔧 Other Commands
Command	Description
npm run dev	Run frontend only
npm run cron	Start scheduled tasks
npm run discord	Launch Discord bot
npm run reset-db	Clear all data (development only)
npm run build && npm start	Production build & start
🌐 Deployment

The project is live on Vercel:
👉 https://vercel.com/periklisatzampos-9000s-projects/v0-remix-of-remix-spark-latest

To continue development visually, open:
👉 https://v0.app/chat/projects/mThqS4vvama

⚙️ Database Reset (Optional)

You can clear all data (keeping tables) via:

npx tsx scripts/reset-db.ts

🛡️ Security Note

Never commit .env files.

Keep a .env.local.example for developers to copy from.

All secrets (DB URLs, bot tokens) should be created individually per user.
