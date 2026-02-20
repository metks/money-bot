import { type Result, err } from "../../shared/types/result.ts";
import { NotFoundError } from "../../shared/errors/app-errors.ts";
import type { ExpenseId } from "../domain/expense.ts";
import type { ExpenseRepository } from "../domain/expense-repository.ts";

export interface DeleteExpenseDto {
  expenseId: ExpenseId;
  userId: string;
}

export class DeleteExpense {
  constructor(private readonly expenseRepo: ExpenseRepository) {}

  async execute(dto: DeleteExpenseDto): Promise<Result<void>> {
    const findResult = await this.expenseRepo.findById(dto.expenseId, dto.userId);
    if (!findResult.ok) return findResult;
    if (!findResult.value) return err(new NotFoundError("Expense"));

    return this.expenseRepo.delete(dto.expenseId, dto.userId);
  }
}
