# Matheo - Architecture Proposal

## Context

This document describes the proposed architecture for Matheo, a Telegram bot for personal finance management. The architecture follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles to keep business logic independent from frameworks, databases, and external services.

The folder structure follows **Screaming Architecture** — when you open `src/`, you immediately see the business domains (expense, receipt, budget), not technical layers (controllers, repositories, services).

Reference: [requirements.md](./requirements.md)

---

## Why DDD + Clean Architecture

- **Testability**: Business rules can be unit-tested without Telegram, Supabase, or OCR dependencies
- **Replaceability**: Swap Supabase for another DB, grammY for telegraf, or Google Vision for Textract — without touching business logic
- **Readability**: New team members can understand the domain by reading the folder names alone
- **Scalability**: Clear boundaries make it safe to evolve features independently

---

## Bounded Contexts & Aggregate Roots

The application is small enough for a single deployable unit, but we identify distinct bounded contexts to keep responsibilities clear. Each context is organized around its **aggregate root**.

```
┌─────────────────────────────────────────────────┐
│                    Matheo                        │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Expense  │  │ Receipt  │  │    Report     │  │
│  │          │  │          │  │               │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
│  ┌──────────┐  ┌──────────┐                      │
│  │  Budget  │  │  User    │                      │
│  │          │  │          │                      │
│  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────┘
```

| Context | Aggregate Root | Responsibility |
|---|---|---|
| **Expense** | `Expense` | Create, read, update, delete expenses. Category assignment. Natural language parsing |
| **Receipt** | `Receipt` | Handle file uploads, OCR extraction, data mapping to expense drafts |
| **Report** | `Report` | Summaries, comparisons, exports (CSV/PDF) |
| **Budget** | `Budget` | Budget CRUD, threshold tracking, alert triggering |
| **User** | `User` | Registration, settings, onboarding, data export/deletion |

---

## Layered Architecture (inside each context)

Each bounded context follows the same three-layer structure. Dependencies point **inward only** — outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────────────────────┐
│                   Infrastructure                         │
│   Supabase Repos  │  OCR Client  │  Telegram Presenter  │
├─────────────────────────────────────────────────────────┤
│                     Application                          │
│            Use Cases  │  DTOs  │  Interfaces             │
├─────────────────────────────────────────────────────────┤
│                       Domain                             │
│       Entities  │  Value Objects  │  Domain Services      │
└─────────────────────────────────────────────────────────┘
```

### Domain (innermost)

Pure TypeScript. No imports from external libraries. Contains the business rules.

- **Entities**: The aggregate root and related domain objects
- **Value Objects**: Immutable types that represent domain concepts (`Money`, `DateRange`)
- **Domain Services**: Logic that doesn't belong to a single entity (`ExpenseParser`, `BudgetChecker`)
- **Interfaces**: Contracts that the infrastructure layer must implement (repositories, external services)

### Application

Orchestrates use cases. Depends only on the domain layer.

- **Use Cases**: Single-purpose classes that execute one business operation
- **DTOs**: Data structures for input/output at the boundary

### Infrastructure

Implements domain interfaces with concrete technologies.

- **Repositories**: Supabase implementations of domain repository interfaces
- **External services**: OCR client, file storage client
- **Presenters**: Format domain output into Telegram-friendly messages (markdown, keyboards)

---

## Project Structure (Screaming Architecture)

The top-level folders are the **business domains**, not technical layers. Each domain folder contains its own `application/`, `domain/`, and `infrastructure/` layers.

```
src/
├── expense/                            # Expense context
│   ├── domain/
│   │   ├── expense.ts                  # Expense entity (aggregate root)
│   │   ├── category.ts                 # Category entity
│   │   ├── expense-repository.ts       # Interface
│   │   ├── category-repository.ts      # Interface
│   │   └── expense-parser.ts           # Domain service: natural language → expense
│   ├── application/
│   │   ├── create-expense.ts           # Use case
│   │   ├── update-expense.ts           # Use case
│   │   ├── delete-expense.ts           # Use case
│   │   ├── list-expenses.ts            # Use case
│   │   └── search-expenses.ts          # Use case
│   └── infrastructure/
│       ├── supabase-expense-repo.ts    # Implements ExpenseRepository
│       ├── supabase-category-repo.ts   # Implements CategoryRepository
│       └── expense-presenter.ts        # Telegram formatting for expenses
│
├── receipt/                            # Receipt context
│   ├── domain/
│   │   ├── receipt.ts                  # Receipt entity (aggregate root)
│   │   ├── receipt-repository.ts       # Interface
│   │   ├── ocr-service.ts             # Interface
│   │   └── file-storage.ts            # Interface
│   ├── application/
│   │   └── process-receipt.ts          # Use case
│   └── infrastructure/
│       ├── supabase-receipt-repo.ts    # Implements ReceiptRepository
│       ├── supabase-file-storage.ts    # Implements FileStorage
│       ├── google-vision-ocr.ts        # Implements OcrService
│       └── receipt-presenter.ts        # Telegram formatting for receipts
│
├── report/                             # Report context
│   ├── domain/
│   │   ├── report.ts                   # Report entity (aggregate root)
│   │   └── report-generator.ts         # Domain service: aggregation logic
│   ├── application/
│   │   ├── get-summary.ts              # Use case
│   │   └── export-report.ts            # Use case
│   └── infrastructure/
│       ├── supabase-report-queries.ts  # Read-only queries for aggregations
│       └── summary-presenter.ts        # Telegram formatting with progress bars
│
├── budget/                             # Budget context
│   ├── domain/
│   │   ├── budget.ts                   # Budget entity (aggregate root)
│   │   ├── budget-repository.ts        # Interface
│   │   └── budget-checker.ts           # Domain service: threshold logic
│   ├── application/
│   │   ├── set-budget.ts               # Use case
│   │   └── check-budgets.ts            # Use case
│   └── infrastructure/
│       ├── supabase-budget-repo.ts     # Implements BudgetRepository
│       └── budget-presenter.ts         # Telegram formatting for budgets
│
├── user/                               # User context
│   ├── domain/
│   │   ├── user.ts                     # User entity (aggregate root)
│   │   └── user-repository.ts          # Interface
│   ├── application/
│   │   ├── register-user.ts            # Use case
│   │   ├── update-settings.ts          # Use case
│   │   └── delete-account.ts           # Use case
│   └── infrastructure/
│       ├── supabase-user-repo.ts       # Implements UserRepository
│       └── settings-presenter.ts       # Telegram formatting for settings
│
├── shared/                             # Cross-cutting concerns
│   ├── domain/
│   │   ├── money.ts                    # Value object: amount + currency
│   │   ├── date-range.ts              # Value object: start/end date pair
│   │   └── telegram-user-id.ts        # Branded type for Telegram ID
│   ├── errors/
│   │   └── app-errors.ts              # Custom error types
│   ├── types/
│   │   └── result.ts                  # Result<T, E> type for error handling
│   └── infrastructure/
│       └── supabase-client.ts         # Shared Supabase client init
│
├── bot/                                # Telegram bot wiring (not a domain)
│   ├── bot.ts                          # grammY bot instance + middleware
│   ├── conversations/
│   │   ├── add-expense.ts              # Multi-step expense flow
│   │   ├── upload-receipt.ts           # Receipt confirmation flow
│   │   ├── onboarding.ts              # /start walkthrough
│   │   └── set-budget.ts              # Budget setup flow
│   ├── handlers/
│   │   ├── expense-handler.ts          # Routes expense commands → use cases
│   │   ├── receipt-handler.ts          # Routes photo/document → use cases
│   │   ├── summary-handler.ts          # Routes summary requests → use cases
│   │   ├── budget-handler.ts           # Routes budget commands → use cases
│   │   └── settings-handler.ts         # Routes settings commands → use cases
│   ├── keyboards/
│   │   └── keyboard-builder.ts         # Shared keyboard construction helpers
│   └── middleware/
│       ├── auth.ts                     # Ensure user exists, attach to context
│       └── error-handler.ts            # Catch errors, send friendly messages
│
├── config/
│   ├── env.ts                          # Environment variable validation
│   └── container.ts                    # Dependency injection / wiring
│
└── api/                                # Vercel entry points
    └── webhook.ts                      # POST /api/webhook — Telegram updates
```

### What this communicates

A new developer opening `src/` sees:

```
expense/   receipt/   report/   budget/   user/   bot/   shared/   config/   api/
```

The domain screams **"this is a finance app"**, not "this is a Node.js app with controllers and repositories."

---

## Dependency Flow

```
Telegram Update
       │
       ▼
  api/webhook.ts                  ← Vercel serverless function
       │
       ▼
  bot/bot.ts                      ← grammY processes the update
       │
       ▼
  bot/handlers/*                  ← Routes update to the right context
       │
       ▼
  {context}/application/*         ← Use case executes business logic
       │
       ├──▶ {context}/domain/*    ← Pure business rules + interfaces
       │
       └──▶ {context}/infra/*     ← Supabase, OCR, file storage
       │
       ▼
  {context}/infra/*-presenter.ts  ← Formats response for Telegram
       │
       ▼
  Telegram Reply (message, keyboard, document)
```

---

## Key Design Decisions

### 1. Dependency Injection

Manual wiring in `container.ts` — no heavy DI framework needed. Each context's infrastructure is instantiated and injected into its use cases.

```typescript
// config/container.ts
import { SupabaseExpenseRepo } from '../expense/infrastructure/supabase-expense-repo';
import { CreateExpense } from '../expense/application/create-expense';

const supabase = createSupabaseClient();

const expenseRepo = new SupabaseExpenseRepo(supabase);
const createExpense = new CreateExpense(expenseRepo);

export { createExpense, /* ... */ };
```

### 2. Result Type over Exceptions

Use a `Result<T, E>` type for expected failures (validation errors, not-found, OCR failures). Reserve exceptions for truly unexpected errors.

```typescript
// shared/types/result.ts
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// expense/application/create-expense.ts
class CreateExpense {
  async execute(input: CreateExpenseInput): Promise<Result<Expense>> {
    if (input.amount <= 0) {
      return { ok: false, error: new ValidationError('Amount must be positive') };
    }
    const expense = Expense.create(input);
    await this.expenseRepo.save(expense);
    return { ok: true, value: expense };
  }
}
```

### 3. Presenters Separate from Business Logic

Telegram message formatting (markdown, keyboards) lives in each context's `infrastructure/` as a presenter. Use cases return plain domain objects; presenters convert them to Telegram-specific output.

```typescript
// expense/infrastructure/expense-presenter.ts
class ExpensePresenter {
  formatSaved(expense: Expense): { text: string; keyboard: InlineKeyboard } {
    return {
      text: `*Saved!* ${expense.category.emoji} ${expense.category.name} — $${expense.amount} — ${expense.date}`,
      keyboard: new InlineKeyboard()
        .text('Edit', `edit:${expense.id}`)
        .text('Delete', `delete:${expense.id}`)
    };
  }
}
```

### 4. Conversation State via grammY Conversations Plugin

Multi-step flows (guided expense entry, onboarding) use grammY's [conversations plugin](https://grammy.dev/plugins/conversations) to manage state in a clean, linear way — no manual state machines.

```typescript
// bot/conversations/add-expense.ts
async function addExpenseConversation(conversation, ctx) {
  await ctx.reply('How much did you spend?');
  const amountCtx = await conversation.waitFor('message:text');
  const amount = parseFloat(amountCtx.message.text);

  await ctx.reply('Pick a category:', { reply_markup: categoryKeyboard });
  const categoryCtx = await conversation.waitFor('callback_query:data');
  const categoryId = categoryCtx.callbackQuery.data;

  // Call use case
  const result = await createExpense.execute({ amount, categoryId, userId });
  // ...
}
```

### 5. Interfaces Live in Domain, Implementations in Infrastructure

Every external dependency is defined as an interface inside the context's `domain/` folder. The `infrastructure/` folder provides the concrete implementation. The application layer depends only on the interface.

```typescript
// receipt/domain/ocr-service.ts
interface OcrService {
  extractFromImage(buffer: Buffer): Promise<Result<ReceiptExtraction>>;
  extractFromPdf(buffer: Buffer): Promise<Result<ReceiptExtraction>>;
}

// receipt/domain/file-storage.ts
interface FileStorage {
  upload(path: string, buffer: Buffer, mimeType: string): Promise<Result<string>>;
  getUrl(path: string): Promise<Result<string>>;
  delete(path: string): Promise<Result<void>>;
}

// receipt/infrastructure/google-vision-ocr.ts
class GoogleVisionOcr implements OcrService {
  async extractFromImage(buffer: Buffer): Promise<Result<ReceiptExtraction>> {
    // Google Vision API call
  }
  // ...
}
```

---

## Domain Model Detail

### Expense Entity

```typescript
// expense/domain/expense.ts
class Expense {
  readonly id: string;
  readonly userId: string;
  readonly amount: Money;
  readonly category: Category;
  readonly description: string | null;
  readonly date: Date;
  readonly paymentMethod: string | null;
  readonly receiptPath: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  static create(input: CreateExpenseInput): Expense { /* ... */ }
  update(changes: Partial<ExpenseFields>): Expense { /* returns new instance */ }
}
```

### Money Value Object

```typescript
// shared/domain/money.ts
class Money {
  constructor(
    readonly amount: number,
    readonly currency: string
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  format(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
```

---

## Testing Strategy

The layered architecture enables focused testing at each level.

| Layer | Test Type | What to Test | Dependencies |
|---|---|---|---|
| **Domain** | Unit tests | Entities, value objects, domain services | None (pure logic) |
| **Application** | Unit tests | Use cases with mocked interfaces | Mocked repositories, services |
| **Infrastructure** | Integration tests | Repos against real Supabase, OCR calls | Supabase test project, API keys |
| **Bot** | E2E tests | Full webhook flow | Telegram test bot, all services |

Tests follow the same screaming structure:

```
tests/
├── expense/
│   ├── domain/
│   │   ├── expense.test.ts
│   │   └── expense-parser.test.ts
│   └── application/
│       ├── create-expense.test.ts
│       └── list-expenses.test.ts
├── receipt/
│   ├── domain/
│   │   └── receipt.test.ts
│   └── application/
│       └── process-receipt.test.ts
├── budget/
│   └── ...
├── shared/
│   └── domain/
│       └── money.test.ts
└── integration/
    ├── supabase-expense-repo.test.ts
    └── google-vision-ocr.test.ts
```

### Example: Testing a Use Case

```typescript
describe('CreateExpense', () => {
  it('should create an expense and persist it', async () => {
    const mockRepo = { save: vi.fn().mockResolvedValue(undefined) };
    const useCase = new CreateExpense(mockRepo);

    const result = await useCase.execute({
      userId: 'user-1',
      amount: 12.50,
      currency: 'USD',
      categoryId: 'cat-food',
      date: new Date('2026-02-03'),
    });

    expect(result.ok).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledOnce();
  });

  it('should reject negative amounts', async () => {
    const mockRepo = { save: vi.fn() };
    const useCase = new CreateExpense(mockRepo);

    const result = await useCase.execute({
      userId: 'user-1',
      amount: -5,
      currency: 'USD',
      categoryId: 'cat-food',
    });

    expect(result.ok).toBe(false);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
```

---

## Deployment Architecture

```
┌──────────┐     webhook POST      ┌──────────────┐
│ Telegram  │ ───────────────────▶  │   Vercel     │
│  Servers  │ ◀───────────────────  │  /api/webhook│
└──────────┘     bot.api.send*()   └──────┬───────┘
                                          │
                            ┌─────────────┼─────────────┐
                            ▼             ▼             ▼
                     ┌───────────┐ ┌───────────┐ ┌───────────┐
                     │ Supabase  │ │ Supabase  │ │  OCR API  │
                     │ Database  │ │ Storage   │ │ (external)│
                     │ (Postgres)│ │ (Receipts)│ │           │
                     └───────────┘ └───────────┘ └───────────┘
```

---

## Migration Path

This architecture supports incremental development:

1. **Start simple**: Implement the `expense/` context end-to-end (domain → application → infrastructure → handler) to validate the structure
2. **Add contexts gradually**: Each context can be built independently
3. **Swap implementations freely**: Start with a simpler OCR (Tesseract), swap to Google Vision later — only `receipt/infrastructure/` changes
4. **Future web dashboard**: The `domain/` and `application/` layers are reusable. Add a new delivery mechanism without duplicating business logic

---

## Open Decisions for the Team

- [ ] **DI approach**: Manual wiring in `container.ts` vs a lightweight DI library (e.g., tsyringe, awilix)?
- [ ] **grammY vs telegraf**: grammY has better TypeScript support and a conversations plugin; telegraf has a larger ecosystem. Preference?
- [ ] **Testing framework**: Vitest (fast, ESM-native) vs Jest?
- [ ] **Monorepo or single package**: Single package is simpler for MVP. Monorepo if we add a web dashboard later?
- [ ] **Error monitoring**: Sentry, LogTail, or Vercel's built-in logging?
