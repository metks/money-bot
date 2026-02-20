import { type Result, err } from "../../shared/types/result.ts";
import { Money } from "../../shared/domain/money.ts";
import { ValidationError, NotFoundError } from "../../shared/errors/app-errors.ts";
import { type Expense, type ExpenseId } from "../domain/expense.ts";
import type { ExpenseRepository } from "../domain/expense-repository.ts";
import { isValidCategory } from "../domain/category.ts";

export interface UpdateExpenseDto {
  expenseId: ExpenseId;
  userId: string;
  changes: {
    money?: { amount: number; currency: string };
    category?: string;
    description?: string;
  };
}

export class UpdateExpense {
  constructor(private readonly expenseRepo: ExpenseRepository) {}

  async execute(dto: UpdateExpenseDto): Promise<Result<Expense>> {
    const findResult = await this.expenseRepo.findById(dto.expenseId, dto.userId);
    if (!findResult.ok) return findResult;
    if (!findResult.value) return err(new NotFoundError("Expense"));

    let expense = findResult.value;
    const { changes } = dto;

    if (changes.category !== undefined) {
      if (!isValidCategory(changes.category)) {
        return err(new ValidationError(`Invalid category: "${changes.category}"`));
      }
      expense = expense.updateCategory(changes.category);
    }

    if (changes.description !== undefined) {
      expense = expense.updateDescription(changes.description);
    }

    if (changes.money !== undefined) {
      const moneyResult = Money.create(changes.money.amount, changes.money.currency);
      if (!moneyResult.ok) return moneyResult;
      expense = expense.updateAmount(moneyResult.value);
    }

    return this.expenseRepo.update(expense);
  }
}
