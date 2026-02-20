import { type Result, err } from "../../shared/types/result.ts";
import { Money } from "../../shared/domain/money.ts";
import { ValidationError } from "../../shared/errors/app-errors.ts";
import { Expense } from "../domain/expense.ts";
import type { ExpenseRepository } from "../domain/expense-repository.ts";
import { isValidCategory } from "../domain/category.ts";

export interface CreateExpenseDto {
  userId: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date?: Date;
}

export class CreateExpense {
  constructor(private readonly expenseRepo: ExpenseRepository) {}

  async execute(dto: CreateExpenseDto): Promise<Result<Expense>> {
    if (!isValidCategory(dto.category)) {
      return err(new ValidationError(`Invalid category: "${dto.category}"`));
    }

    const moneyResult = Money.create(dto.amount, dto.currency);
    if (!moneyResult.ok) return moneyResult;

    const expense = Expense.create({
      userId: dto.userId,
      amount: moneyResult.value,
      category: dto.category,
      description: dto.description || "",
      date: dto.date || new Date(),
    });

    return this.expenseRepo.save(expense);
  }
}
