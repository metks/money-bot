export enum ExpenseCategory {
  FOOD = "food",
  TRANSPORT = "transport",
  HEALTH = "health",
  SHOPPING = "shopping",
  ENTERTAINMENT = "entertainment",
  UTILITIES = "utilities",
  OTHER = "other",
}

export const getAllCategories = (): ExpenseCategory[] => {
  return Object.values(ExpenseCategory);
};

export const isValidCategory = (value: string): value is ExpenseCategory => {
  return Object.values(ExpenseCategory).includes(value as ExpenseCategory);
};

export const getCategoryEmoji = (category: ExpenseCategory): string => {
  const emojiMap: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: "🍽️",
    [ExpenseCategory.TRANSPORT]: "🚗",
    [ExpenseCategory.HEALTH]: "🏥",
    [ExpenseCategory.SHOPPING]: "🛍️",
    [ExpenseCategory.ENTERTAINMENT]: "🎬",
    [ExpenseCategory.UTILITIES]: "💡",
    [ExpenseCategory.OTHER]: "📌",
  };
  return emojiMap[category];
};

export const getCategoryDisplayName = (category: ExpenseCategory): string => {
  const nameMap: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: "Food",
    [ExpenseCategory.TRANSPORT]: "Transport",
    [ExpenseCategory.HEALTH]: "Health",
    [ExpenseCategory.SHOPPING]: "Shopping",
    [ExpenseCategory.ENTERTAINMENT]: "Entertainment",
    [ExpenseCategory.UTILITIES]: "Utilities",
    [ExpenseCategory.OTHER]: "Other",
  };
  return nameMap[category];
};
