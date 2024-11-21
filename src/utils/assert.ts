class AssertionError extends Error {
  name = "AssertionError";
  code = "ERR_ASSERTION";
  constructor(
    message = "",
    public actual: unknown,
    public expected: unknown = "true",
    public operator = "==",
  ) {
    super(message || `${String(actual)} ${operator} ${String(expected)}`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const assert: (value: unknown, message?: string) => asserts value = (value, message) => {
  if (value === undefined || value === null) {
    throw new AssertionError(message, value);
  }
};
