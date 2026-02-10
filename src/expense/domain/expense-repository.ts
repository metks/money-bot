import type { Expense, ExpenseId } from "./expense.ts";
import type { Result } from "../../shared/types/result.ts";

export interface ExpenseRepository {
  save(expense: Expense): Promise<Result<Expense>>;

  update(expense: Expense): Promise<Result<Expense>>;

  findById(
    expenseId: ExpenseId,
    userId: string,
  ): Promise<Result<Expense | null>>;

  findByUser(
    userId: string,
    filters?: {
      category?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<Result<Expense[]>>;

  delete(expenseId: ExpenseId, userId: string): Promise<Result<void>>;
}
