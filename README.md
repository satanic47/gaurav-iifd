# OmniPost AI - Social Media Automation & Scheduling Hub

An AI-powered social media automation web application built for marketing agencies and multi-brand businesses (similar to Buffer / Hootsuite), with integrated Google Gemini & OpenAI creative copywriting, hashtag generation, and automated daily scheduling.

---

## 🌟 Key Features Built (Phase 1)

1. **Multi-Client / Agency Workspaces**:
   - Seamlessly switch between different brands and clients (e.g., *Luxe Fashion Studio*, *CloudScale AI*).
   - Add new client workspaces with one click.
   - Each client retains isolated social accounts, scheduling slots, and post queues.

2. **6 Major Supported Platforms**:
   - 📸 **Instagram** (Business / Creator accounts via Meta Graph API)
   - 📘 **Facebook** (Pages and Groups)
   - 💼 **LinkedIn** (Company Organization Pages and Member Profiles)
   - ▶️ **YouTube** (Community Posts / Video links)
   - 📌 **Pinterest** (Boards & Pins API)
   - 📍 **Google Business Profile** (Local updates & announcement posts)

3. **Unified Post Composer**:
   - Multi-channel selector: post simultaneously to Instagram, Facebook, and LinkedIn in one go.
   - Live real-time Feed Preview of caption, hashtags, and media graphics.
   - Image & video creative URL preview.

4. **Buffer-Style Daily Auto-Post Scheduler**:
   - Configure recurring daily posting slots (e.g., Monday 10:00 AM, Wednesday 3:00 PM, Friday 6:00 PM).
   - **"Add to Queue"**: Automatically calculates and schedules into the client's next available time slot.
   - **"Specific Date/Time"**: Custom date & time scheduling.
   - **"Publish Now"**: Instant multi-channel dispatch.

5. **Automated Background Cron Worker**:
   - Endpoint: `/api/cron/publish`
   - Scans scheduled posts whose time is due, executes platform publishing, and updates delivery receipts.
   - Includes manual "Run Due Posts Now" trigger on the dashboard.

6. **Gemini & OpenAI Creative Studio**:
   - Generates high-converting hooks, engaging copy, platform-tailored hashtags, and image/video visual prompts based on target keywords and tone.
   - 1-Click *"Apply to Composer"* button.

7. **Dual-Mode API Support**:
   - **Sandbox Simulator Mode**: Runs out-of-the-box without waiting for Meta / Google developer approvals, returning realistic receipts.
   - **Live API Mode**: Supply OAuth access tokens in the Channels tab or environment variables for direct production publishing.

---

## 🚀 How to Run Locally

### 1. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. (Optional) Re-seed Sample Client Data
```bash
npm run seed
```

### 3. Environment Variables (.env)
```env
DATABASE_URL="file:./dev.db"

# Optional: Add your Google Gemini API Key for live AI generation
GEMINI_API_KEY=""

# Optional: Add your OpenAI API Key
OPENAI_API_KEY=""
```

---

## 📁 Project Architecture

- `src/components/SocialDashboard.tsx`: Complete responsive agency dashboard with tabs for Composer, Queue, Channels, History, and AI Studio.
- `src/lib/socialPublisher.ts`: Multi-platform publishing engine for Meta Graph API, LinkedIn UGC API, Pinterest API, Google Business Profile API, and Sandbox Simulator.
- `src/lib/prisma.ts`: Singleton database client.
- `src/app/api/clients/`: Client creation and listing.
- `src/app/api/accounts/`: Connect & manage social channels.
- `src/app/api/posts/`: Post composition, immediate dispatch, and queue calculation.
- `src/app/api/schedules/`: Buffer-style daily time slot manager.
- `src/app/api/cron/publish/`: Automated background publisher.
- `src/app/api/ai/generate/`: Gemini/OpenAI copy and hashtag generator.
- `prisma/schema.prisma`: SQLite database schema with Client, SocialAccount, Post, PostTarget, and ScheduleSetting models.
