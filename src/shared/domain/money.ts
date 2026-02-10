import { ValidationError } from "../errors/app-errors.ts";
import { err, ok, type Result } from "../types/result.ts";

export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: string,
  ) {}

  static create(
    amount: number,
    currency: string,
  ): Result<Money, ValidationError> {
    if (amount < 0) {
      return err(new ValidationError("Amount cannot be negative"));
    }
    return ok(new Money(amount, currency));
  }

  add(other: Money): Result<Money, ValidationError> {
    this.assertSameCurrency(other);
    return ok(new Money(this.amount + other.amount, this.currency));
  }

  format(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}
