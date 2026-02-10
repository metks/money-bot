import { Money } from "../../shared/domain/money.ts";

export type ExpenseId = string & { readonly __brand: "ExpenseId" };

export const createExpenseId = (id: string): ExpenseId => id as ExpenseId;

export interface ExpenseProps {
  id: ExpenseId;
  userId: string;
  amount: Money;
  category: string;
  description: string | undefined;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Expense {
  private constructor(private readonly props: ExpenseProps) {}

  static create(input: {
    userId: string;
    amount: Money;
    category: string;
    description?: string;
    date?: Date;
  }): Expense {
    const id = createExpenseId(crypto.randomUUID());
    const now = new Date();

    return new Expense({
      id,
      userId: input.userId,
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: input.date || now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: ExpenseProps): Expense {
    return new Expense(props);
  }

  updateCategory(category: string): Expense {
    return new Expense({
      ...this.props,
      category,
      updatedAt: new Date(),
    });
  }

  updateDescription(description: string): Expense {
    return new Expense({
      ...this.props,
      description,
      updatedAt: new Date(),
    });
  }

  updateAmount(amount: Money): Expense {
    return new Expense({
      ...this.props,
      amount,
      updatedAt: new Date(),
    });
  }
}
