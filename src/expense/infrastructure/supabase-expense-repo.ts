import type { SupabaseClient } from "@supabase/supabase-js";
import { type Result, ok, err } from "../../shared/types/result.ts";
import { AppError } from "../../shared/errors/app-errors.ts";
import { Money } from "../../shared/domain/money.ts";
import {
  Expense,
  createExpenseId,
  type ExpenseId,
  type ExpenseProps,
} from "../domain/expense.ts";
import type { ExpenseRepository } from "../domain/expense-repository.ts";

interface ExpenseRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

function toDomain(row: ExpenseRow): Result<Expense> {
  const moneyResult = Money.create(row.amount, row.currency);
  if (!moneyResult.ok) return moneyResult;

  const props: ExpenseProps = {
    id: createExpenseId(row.id),
    userId: row.user_id,
    amount: moneyResult.value,
    category: row.category,
    description: row.description ?? undefined,
    date: new Date(row.date),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };

  return ok(Expense.fromPersistence(props));
}

function toRow(expense: Expense): Omit<ExpenseRow, "created_at" | "updated_at"> {
  const snap = expense.toSnapshot();
  return {
    id: snap.id,
    user_id: snap.userId,
    amount: snap.amount.amount,
    currency: snap.amount.currency,
    category: snap.category,
    description: snap.description ?? null,
    date: snap.date.toISOString().split("T")[0]!,
  };
}

export class SupabaseExpenseRepo implements ExpenseRepository {
  constructor(private readonly db: SupabaseClient) {}

  async save(expense: Expense): Promise<Result<Expense>> {
    const { data, error } = await this.db
      .from("expenses")
      .insert(toRow(expense))
      .select()
      .single<ExpenseRow>();

    if (error) return err(new AppError(error.message, "DB_ERROR"));
    return toDomain(data);
  }

  async update(expense: Expense): Promise<Result<Expense>> {
    const snap = expense.toSnapshot();
    const { data, error } = await this.db
      .from("expenses")
      .update(toRow(expense))
      .eq("id", snap.id)
      .eq("user_id", snap.userId)
      .select()
      .single<ExpenseRow>();

    if (error) return err(new AppError(error.message, "DB_ERROR"));
    return toDomain(data);
  }

  async findById(
    expenseId: ExpenseId,
    userId: string,
  ): Promise<Result<Expense | null>> {
    const { data, error } = await this.db
      .from("expenses")
      .select()
      .eq("id", expenseId)
      .eq("user_id", userId)
      .maybeSingle<ExpenseRow>();

    if (error) return err(new AppError(error.message, "DB_ERROR"));
    if (!data) return ok(null);
    return toDomain(data);
  }

  async findByUser(
    userId: string,
    filters?: { category?: string; startDate?: Date; endDate?: Date },
  ): Promise<Result<Expense[]>> {
    let query = this.db
      .from("expenses")
      .select()
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.startDate) {
      query = query.gte("date", filters.startDate.toISOString().split("T")[0]);
    }
    if (filters?.endDate) {
      query = query.lte("date", filters.endDate.toISOString().split("T")[0]);
    }

    const { data, error } = await query.returns<ExpenseRow[]>();

    if (error) return err(new AppError(error.message, "DB_ERROR"));

    const expenses: Expense[] = [];
    for (const row of data) {
      const result = toDomain(row);
      if (!result.ok) return result;
      expenses.push(result.value);
    }
    return ok(expenses);
  }

  async delete(expenseId: ExpenseId, userId: string): Promise<Result<void>> {
    const { error } = await this.db
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", userId);

    if (error) return err(new AppError(error.message, "DB_ERROR"));
    return ok(undefined);
  }
}
