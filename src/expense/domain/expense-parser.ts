import type { Result } from "../../shared/types/result.ts";
import { ok, err } from "../../shared/types/result.ts";
import { ValidationError } from "../../shared/errors/app-errors.ts";
import { Money } from "../../shared/domain/money.ts";
import { ExpenseCategory, isValidCategory } from "./category.ts";

export interface ParsedExpense {
  amount: Money;
  category: ExpenseCategory;
  description: string | undefined;
}

export class ExpenseParser {
  parse(
    input: string,
    defaultCurrency: string = "USD",
  ): Result<ParsedExpense, ValidationError> {
    const trimmed = input.trim();

    if (!trimmed) {
      return err(new ValidationError("Input cannot be empty"));
    }

    const amountMatch = trimmed.match(/(\d+(?:\.\d{2})?)/);
    if (!amountMatch) {
      return err(new ValidationError("No valid amount found in input"));
    }

    const amountStr = amountMatch[1]!;
    const remaining = trimmed.replace(amountStr, "").trim();

    let amount: Money;
    try {
      const result = Money.create(parseFloat(amountStr), defaultCurrency);
      if (!result.ok) {
        return err(new ValidationError(`Invalid amount: ${amountStr}`));
      }
      amount = result.value;
    } catch (e) {
      return err(new ValidationError(`Invalid amount: ${amountStr}`));
    }

    let category = ExpenseCategory.OTHER;
    let description: string | undefined;

    if (remaining) {
      const words = remaining.split(/\s+/);
      const firstWord = words[0]?.toLowerCase();

      if (firstWord && isValidCategory(firstWord)) {
        category = firstWord as ExpenseCategory;
        description = words.slice(1).join(" ") || undefined;
      } else {
        description = remaining;
      }
    }

    return ok<ParsedExpense>({
      amount,
      category,
      description,
    });
  }

  guessCategory(description: string): ExpenseCategory {
    const text = description.toLowerCase();

    const categoryKeywords: Record<ExpenseCategory, string[]> = {
      [ExpenseCategory.FOOD]: [
        "lunch",
        "dinner",
        "breakfast",
        "coffee",
        "restaurant",
        "food",
        "meal",
        "pizza",
        "burger",
      ],
      [ExpenseCategory.TRANSPORT]: [
        "taxi",
        "bus",
        "train",
        "car",
        "uber",
        "gas",
        "petrol",
        "parking",
        "transport",
      ],
      [ExpenseCategory.HEALTH]: [
        "doctor",
        "hospital",
        "pharmacy",
        "medicine",
        "health",
        "dentist",
      ],
      [ExpenseCategory.SHOPPING]: [
        "store",
        "shop",
        "mall",
        "market",
        "clothes",
        "dress",
        "shoes",
      ],
      [ExpenseCategory.ENTERTAINMENT]: [
        "movie",
        "cinema",
        "game",
        "concert",
        "music",
        "entertainment",
      ],
      [ExpenseCategory.UTILITIES]: [
        "electric",
        "water",
        "gas",
        "internet",
        "phone",
        "utilities",
        "bill",
      ],
      [ExpenseCategory.OTHER]: [],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category as ExpenseCategory;
      }
    }

    return ExpenseCategory.OTHER;
  }
}
