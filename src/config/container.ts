import { getSupabaseClient } from "../shared/infrastructure/supabase-client.ts";
import { SupabaseExpenseRepo } from "../expense/infrastructure/supabase-expense-repo.ts";
import { ExpensePresenter } from "../expense/infrastructure/expense-presenter.ts";
import { CreateExpense } from "../expense/application/create-expense.ts";
import { UpdateExpense } from "../expense/application/update-expense.ts";
import { DeleteExpense } from "../expense/application/delete-expense.ts";
import { ListExpenses } from "../expense/application/list-expenses.ts";
import { SearchExpenses } from "../expense/application/search-expenses.ts";

const db = getSupabaseClient();

const expenseRepo = new SupabaseExpenseRepo(db);

export const expensePresenter = new ExpensePresenter();

export const createExpense = new CreateExpense(expenseRepo);
export const updateExpense = new UpdateExpense(expenseRepo);
export const deleteExpense = new DeleteExpense(expenseRepo);
export const listExpenses = new ListExpenses(expenseRepo);
export const searchExpenses = new SearchExpenses(expenseRepo);
