# Matheo - Personal Finance Telegram Bot

## Overview

Matheo is a Telegram bot designed to simplify personal finance management. Users can track expenses, upload invoices, and get insights into their spending habits directly from Telegram. The experience should feel native to Telegram — minimal typing, guided flows, and visual feedback at every step.

## Goals

- Provide a frictionless way to log daily expenses via chat
- Extract expense data automatically from uploaded invoices/receipts
- Categorize and summarize spending over time
- Reduce manual bookkeeping effort
- **Deliver a polished, intuitive UX that leverages Telegram's native capabilities**

## Target Users

- Individual users managing personal or household finances

---

## UX Principles

The bot must feel like a conversation, not a command-line tool. Every interaction should be guided and forgiving.

### Design Guidelines

- **Minimal typing**: Prefer taps over text. Use inline keyboards, reply keyboards, and callback buttons for all common actions
- **Conversational flows**: Multi-step actions (e.g., adding an expense) should be guided step-by-step with clear prompts, not require memorizing command syntax
- **Smart defaults**: Pre-fill dates (today), suggest the most-used categories first, remember the last currency
- **Instant feedback**: Every action gets a confirmation message (with edit/undo buttons). Never leave the user wondering if something worked
- **Forgiving input**: Accept natural text like `coffee 4.50` or `4.50 coffee` — the bot should parse both. If it can't understand, ask a clarifying question instead of showing an error
- **Visual formatting**: Use Telegram's markdown for clean output — bold totals, category emojis in lists, progress bars for budgets
- **Undo / Edit**: After saving an expense, show inline buttons to edit or delete it immediately
- **No dead ends**: Every screen/message should have a way to go back or cancel

### Telegram Features to Leverage

| Feature | Usage |
|---|---|
| **Inline Keyboards** | Category selection, confirm/cancel, pagination, quick filters |
| **Reply Keyboards** | Persistent quick-access buttons (e.g., "Add Expense", "Summary", "Upload Invoice") |
| **Callback Queries** | Handle button taps without new messages, update existing messages in-place |
| **Message Editing** | Update the current message instead of sending new ones (keeps chat clean) |
| **Photo/Document handling** | Direct upload of receipts — user just sends a photo, bot handles the rest |
| **Inline mode** | Allow users to search expenses from any chat via `@matheo_bot query` |
| **Menu button** | Custom menu button linking to the bot's command list |
| **Bot commands menu** | Register commands so they appear in Telegram's `/` autocomplete |
| **Formatted messages** | MarkdownV2 for clean, readable summaries and reports |
| **File sending** | Send CSV/PDF exports as documents directly in chat |

### Conversation Flow Examples

**Adding an expense (guided):**
```
User taps: [ Add Expense ]  (reply keyboard)
Bot:  "How much did you spend?"
User: "12.50"
Bot:  "Pick a category:"
      [ Food ] [ Transport ] [ Health ] [ Shopping ]
      [ Entertainment ] [ Utilities ] [ Other ]
User taps: [ Food ]
Bot:  "Add a note? (or tap Skip)"
      [ Skip ]
User taps: [ Skip ]
Bot:  "Saved! Food — $12.50 — today"
      [ Edit ] [ Delete ] [ Add another ]
```

**Adding an expense (quick — natural language):**
```
User: "lunch 12.50"
Bot:  "Saved! Food — $12.50 — today"
      [ Edit ] [ Delete ]
```

**Uploading a receipt:**
```
User sends a photo of a receipt
Bot:  "Processing your receipt..."
Bot:  "I found this:
       Store: Walmart
       Date: Feb 3, 2026
       Total: $47.82
       Is this correct?"
      [ Yes, save ] [ Edit details ] [ Cancel ]
User taps: [ Yes, save ]
Bot:  "Pick a category:"
      [ Shopping ] [ Food ] [ Other ]
```

**Viewing summary:**
```
User taps: [ Summary ]  (reply keyboard)
Bot:  "Pick a period:"
      [ This week ] [ This month ] [ Last month ] [ Custom range ]
User taps: [ This month ]
Bot:  "February 2026

       Food         $245.00  ████████░░  62%
       Transport     $85.00  ███░░░░░░░  21%
       Shopping      $47.82  ██░░░░░░░░  12%
       Other         $20.00  █░░░░░░░░░   5%
       ─────────────────────────
       Total        $397.82

       [ Export CSV ] [ Export PDF ] [ Compare to Jan ]"
```

---

## Functional Requirements

### 1. Expense Tracking

- **Guided entry**: Step-by-step flow via inline keyboards (amount → category → note → confirmation)
- **Quick entry**: Natural language parsing — user types `coffee 4.50` and the bot saves it with smart category detection
- **Required fields**: amount, category
- **Optional fields**: description/note, date (defaults to today), payment method
- **Default categories**: Food, Transport, Housing, Utilities, Health, Entertainment, Shopping, Education, Other (each with an emoji for visual clarity)
- **Custom categories**: Users can create and manage their own categories
- **Currency**: Default currency per user, with option to log in other currencies
- **Post-save actions**: Every saved expense shows inline buttons for Edit, Delete, Add Another
- **Edit flow**: Tap "Edit" to modify any field via inline keyboard without retyping everything

### 2. Invoice / Receipt Upload

- **Supported formats**: Images (JPG, PNG), PDF
- **Zero-friction upload**: User sends a photo or document — no command needed, the bot detects it and starts processing
- **OCR processing**: Extract merchant name, date, total amount, and line items
- **Confirmation flow**: Present parsed data with [ Yes, save ] / [ Edit details ] / [ Cancel ] buttons
- **Edit before save**: If OCR data is wrong, user can tap "Edit details" and correct specific fields via inline keyboard
- **Storage**: Store the original file in Supabase Storage, linked to the expense record
- **Fallback**: If OCR fails, show a friendly message and switch to the guided manual entry flow with what data was extracted pre-filled

### 3. Expense Listing & Search

- **Quick list**: Reply keyboard button shows last 7 days of expenses
- **Filter by date**: Inline keyboard with presets (today, this week, this month, custom range)
- **Filter by category**: Tap a category button to filter
- **Search**: `/search coffee` or just type a keyword when in search mode
- **Pagination**: Navigate via [ Previous ] / [ Next ] inline buttons
- **Tap to detail**: Each expense in the list is tappable to view full details and edit/delete

### 4. Reports & Summaries

- **Visual summaries**: Text-based progress bars, bold totals, category breakdown with emojis
- **Periods**: This week, this month, last month, custom date range — all selectable via inline keyboard
- **Comparison**: Side-by-side current vs previous period
- **Export**: [ Export CSV ] and [ Export PDF ] buttons — file sent as a Telegram document

### 5. Budget Management

- **Set budgets**: Per category or overall, guided via inline keyboard
- **Visual progress**: Budget bars showing spent vs limit
- **Proactive alerts**: Bot sends a message when spending reaches 80% and 100% of a budget
- **Budget overview**: Reply keyboard button or `/budget` command

### 6. User Onboarding & Settings

- **First interaction (`/start`)**: Welcome message with a brief walkthrough. Set default currency and timezone via inline keyboard. Show the reply keyboard with main actions
- **Persistent reply keyboard**: Always visible with main actions: [ Add Expense ] [ Summary ] [ Upload Invoice ] [ Settings ]
- **Settings menu**: Currency, timezone, notification preferences, manage categories — all navigable via inline buttons
- **Data privacy**: `/export` (sends all data as CSV) and `/deleteaccount` (with confirmation step)

---

## Technical Stack

| Component | Technology |
|---|---|
| **Backend** | Node.js / TypeScript (grammY or telegraf) |
| **Hosting** | Vercel (free tier) — bot runs as serverless API routes via webhook mode |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth — map Telegram user ID to Supabase user |
| **File Storage** | Supabase Storage — receipts/invoices linked to expense records |
| **Real-time** | Supabase Realtime (if needed for multi-device sync or future web dashboard) |
| **OCR Service** | To discuss: Google Vision API / AWS Textract / Tesseract |
| **Row-Level Security** | Supabase RLS policies to isolate user data at the database level |

### Vercel Considerations

- **Webhook mode required**: Telegram sends updates to a Vercel API route (e.g., `/api/webhook`). Polling is not compatible with serverless
- **Free tier limits**: 100 GB bandwidth, 100K function invocations/month, 10s execution timeout (standard), 60s (with streaming). OCR processing must stay within these limits or be offloaded
- **Cold starts**: Serverless functions may have cold starts. For Telegram bots this is acceptable since users tolerate ~1-2s response times
- **Environment variables**: Bot token, Supabase URL, and keys stored in Vercel environment settings
- **Framework**: Next.js API routes or plain serverless functions — either works

### Supabase Architecture

- **Tables**: `users`, `expenses`, `categories`, `budgets`, `receipts`
- **Storage buckets**: `receipts` bucket for uploaded invoice files
- **RLS policies**: Every table filtered by `user_id` — users can only access their own data
- **Supabase Edge Functions** (optional): Offload OCR processing if it exceeds Vercel's timeout limits
- **Database functions**: Use Postgres functions for summary aggregations (faster than application-level queries)

### Proposed Database Schema

```
users
├── id (uuid, PK)
├── telegram_id (bigint, unique)
├── username (text)
├── default_currency (text, default 'USD')
├── timezone (text, default 'UTC')
├── created_at (timestamptz)
└── updated_at (timestamptz)

categories
├── id (uuid, PK)
├── user_id (uuid, FK → users.id, nullable — null = default category)
├── name (text)
├── emoji (text)
├── sort_order (int)
└── created_at (timestamptz)

expenses
├── id (uuid, PK)
├── user_id (uuid, FK → users.id)
├── category_id (uuid, FK → categories.id)
├── amount (numeric)
├── currency (text)
├── description (text)
├── date (date)
├── payment_method (text)
├── receipt_path (text, nullable — path in Supabase Storage)
├── created_at (timestamptz)
└── updated_at (timestamptz)

budgets
├── id (uuid, PK)
├── user_id (uuid, FK → users.id)
├── category_id (uuid, FK → categories.id, nullable — null = overall budget)
├── amount (numeric)
├── currency (text)
├── period (text — 'monthly')
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

---

## Non-Functional Requirements

### Security

- Supabase RLS policies enforce data isolation at the database level
- No sensitive financial data (bank credentials, card numbers) is collected
- File uploads validated for type and size before processing
- Bot token stored as environment variable, never in code

### Performance

- Bot responses within 2 seconds for text commands
- Invoice processing (OCR) within 10 seconds
- Use Supabase connection pooling for efficient database access

### Reliability

- Graceful error handling with user-friendly messages (never show raw errors)
- Retry logic for external service calls (OCR, Supabase)
- Logging and monitoring for troubleshooting

### Scalability

- Stateless bot design to allow horizontal scaling
- Supabase handles database scaling and file storage
- Webhook mode (not polling) for production deployment

---

## MVP Scope (Phase 1)

1. User onboarding with currency/timezone setup
2. Persistent reply keyboard with main actions
3. Guided expense entry via inline keyboards
4. Quick natural-language expense entry
5. Invoice/receipt upload with OCR and confirmation flow
6. Expense listing with filters and pagination
7. Monthly summary with category breakdown
8. Basic settings (currency, timezone)
9. Supabase database with RLS
10. Supabase Storage for receipts

### Out of MVP (Phase 2+)

- Budget management and alerts
- Multi-currency conversion
- Recurring expenses
- Shared expenses / group splitting
- Bank statement import
- AI-powered spending insights and recommendations
- Inline mode for cross-chat queries
- Web dashboard (leveraging Supabase)

---

## Open Questions

- [ ] Which OCR service best balances cost, accuracy, and speed for our use case?
- [ ] grammY vs telegraf for the Telegram bot framework?
- [ ] Should we support group chats or only private conversations?
- [ ] Do we need multi-language support from the start?
- [ ] What is the expected user volume for infrastructure sizing?
- [ ] How long should uploaded invoice files be retained in Supabase Storage?
