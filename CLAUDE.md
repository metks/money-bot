# Matheo - Telegram Expense Bot

Personal finance Telegram bot for tracking expenses, uploading receipts (OCR), and viewing spending summaries.

## Tech Stack

- Node.js + TypeScript
- grammY (Telegram bot framework)
- Vercel (serverless hosting)
- Supabase (PostgreSQL + file storage)
- Tesseract (OCR, may upgrade to Google Vision later)  


## Architecture

DDD + Clean Architecture with screaming folder structure. See docs/architecture.md

## Key Principles

- Minimal typing — prefer buttons over text input
- Conversational flows — guided step-by-step interactions
- Every action gets confirmation with edit/undo options  


## Docs

- [Requirements](./docs/requirements.md)
- [Architecture](./docs/architecture.md)
