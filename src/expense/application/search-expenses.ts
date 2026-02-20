import { type Result, ok } from "../../shared/types/result.ts";
import type { Expense } from "../domain/expense.ts";
import type { ExpenseRepository } from "../domain/expense-repository.ts";

export interface SearchExpensesDto {
  userId: string;
  query: string;
}

export class SearchExpenses {
  constructor(private readonly expenseRepo: ExpenseRepository) {}

  async execute(dto: SearchExpensesDto): Promise<Result<Expense[]>> {
    const allResult = await this.expenseRepo.findByUser(dto.userId);
    if (!allResult.ok) return allResult;

    return ok(allResult.value.filter((expense) => expense.matches(dto.query)));
  }
}
