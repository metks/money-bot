# Matheo Copilot Instructions

Matheo is a **Domain-Driven Design (DDD) + Clean Architecture** Telegram bot for personal finance management.

## Architecture Overview

**Screaming Architecture**: Business domains (_expense_, _receipt_, _budget_, _report_, _user_) are top-level folders, not technical layers. Each domain contains three layers:

- **Domain**: Pure TypeScript, zero external dependencies. Entities, Value Objects (`Money`), Domain Services, Repository/Service interfaces.
- **Application**: Use case orchestration, DTOs, depends only on domain layer.
- **Infrastructure**: Concrete implementations—Supabase repos, OCR clients, Telegram presenters, file storage.

**Key principle**: Dependencies point inward only. Infrastructure imports Application/Domain, Application imports Domain, Domain imports nothing.

### Bounded Contexts

| Context     | Root Aggregate | Purpose                                         |
| ----------- | -------------- | ----------------------------------------------- |
| **Expense** | `Expense`      | CRUD, category assignment, NLP parsing          |
| **Receipt** | `Receipt`      | File uploads, OCR extraction, draft mapping     |
| **Report**  | `Report`       | Summaries, comparisons, CSV/PDF exports         |
| **Budget**  | `Budget`       | CRUD, threshold tracking, alert logic           |
| **User**    | `User`         | Registration, settings, onboarding, data export |

## Critical Patterns

### Value Objects & Error Handling

Value Objects are immutable domain concepts. Example: `Money` in [src/shared/domain/money.ts](src/shared/domain/money.ts) validates invariants (non-negative amounts) and rejects cross-currency operations.

**Result Type** (see [src/shared/types/result.ts](src/shared/types/result.ts)): Use `Result<T, E>` for operations that may fail. Examples:

```typescript
const result = ok(expense);  // Success
const result = err(new ValidationError("Amount cannot be negative"));  // Failure
```

### Error Hierarchy

Domain errors inherit from [AppError](src/shared/errors/app-errors.ts): `ValidationError`, `NotFoundError`. Each has a string `code` for programmatic handling. Use in application layer to catch and transform before presenting to Telegram.

### Use Case Pattern

Each use case is a single-purpose class that:

1. Takes DTOs as input (e.g., `CreateExpenseRequest`)
2. Calls domain services / repositories
3. Returns `Result<OutputDTO, AppError>`

Example structure: `src/expense/application/create-expense.ts` orchestrates validation, entity creation, persistence, and returns the saved expense to the presenter.

## Telegram Integration

The bot follows **minimal typing, conversational flows** (see [requirements.md](docs/requirements.md)).

- **Keyboards**: Inline keyboards for single-use buttons (categories, confirm/cancel). Reply keyboards for persistent menu (Add Expense, Summary).
- **Presenters**: Infrastructure layer formats domain objects into Telegram messages. Presenters live at `src/{domain}/infrastructure/{domain}-presenter.ts`.
- **Message Editing**: Reuse callback queries to edit existing messages instead of sending new ones—keeps chat clean.
- **Callback Flow**: Handler → Use Case → Presenter → Update or send message.

## Conventions

- **File naming**: kebab-case for files (`create-expense.ts`), PascalCase for classes (`CreateExpense`).
- **Lazy public constructor**: Value Objects and Entities use `private constructor` + `static create()` factory to enforce invariants at creation time.
- **No nulls in domain**: Use `Result<T>` or throw errors instead. Null checks belong in infrastructure (Supabase queries).
- **Environment**: Required vars defined in [src/config/env.ts](src/config/env.ts) via `requireEnv()`. Missing vars throw at startup.
- **Folders screaming intent**: Presence of `expense/`, `receipt/` signals those domains exist. No need for READMEs; folder names are self-documenting.

## Development Workflows

**Build/Run**: Add `dev` and `build` scripts to `package.json` as needed. Currently no test scripts. When adding tests, use a domain-focused test structure (tests mirror domain structure).

**Dependency Management**:

- Core: grammY (Telegram), Supabase (DB/storage), Tesseract (OCR).
- May upgrade OCR to Google Vision—abstract via `OcrService` interface in receipt domain to enable swapping.

**Environment Setup**: Copy `.env.example` (if present) or create `.env` with `BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

## Key Files to Understand First

1. [docs/architecture.md](docs/architecture.md) — Full layering details & aggregate boundaries.
2. [docs/requirements.md](docs/requirements.md) — UX principles & conversation flow examples.
3. [src/shared/domain/money.ts](src/shared/domain/money.ts) — Value Object pattern.
4. [src/shared/errors/app-errors.ts](src/shared/errors/app-errors.ts) — Error hierarchy.
5. [src/config/env.ts](src/config/env.ts) — Environment configuration.

## When Adding Features

1. **Define the aggregate root & entities** in `{domain}/domain/`.
2. **Write repository/service interfaces** in domain (what infrastructure must implement).
3. **Add use cases** in `{domain}/application/` that orchestrate domain logic.
4. **Implement repositories & presenters** in `{domain}/infrastructure/`.
5. **Wire into Telegram handlers** in `src/bot/handlers/` (calling use cases, catching errors, presenting results).

Ensure domain logic never imports from infrastructure or bot. Test domain independently.
