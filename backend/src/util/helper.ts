import * as moment from 'moment';

/**
 * Calculate an expiration date by adding a specified number of hours.
 */
export function calculateExpirationDate(hours: number): Date {
  return moment().add(hours, 'hours').toDate();
}

/**
 * Generate a random integer between the specified minimum and maximum values.
 */
export function between(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Generate a random six-digit number (100000 to 999999).
 */
export function generateOtp(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

/**
 * Test code value (if required for other purposes).
 */
export const testCode = 123456;

/**
 * Format money
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
