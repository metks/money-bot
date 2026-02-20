import type { Result } from "../../shared/types/result.ts";
import type { Expense } from "../domain/expense.ts";
import type { ExpenseRepository } from "../domain/expense-repository.ts";

export interface ListExpensesDto {
  userId: string;
  filters?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export class ListExpenses {
  constructor(private readonly expenseRepo: ExpenseRepository) {}

  async execute(dto: ListExpensesDto): Promise<Result<Expense[]>> {
    return this.expenseRepo.findByUser(dto.userId, dto.filters);
  }
}
