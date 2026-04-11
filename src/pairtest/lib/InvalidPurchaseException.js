/**
 * Intentionally minimal for this exercise.
 * In production would include error codes and contextual metadata,
 * e.g. timestamp and correlation ID.
 */
export default class InvalidPurchaseException extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidPurchaseException';
  }
}
