const calculateFine = require("../utils/fineCalculator");

describe("Fine Calculator", () => {

  test("should return 0 when returned on due date", () => {
    const fine = calculateFine(
      "2026-10-11",
      "2026-10-11"
    );

    expect(fine).toBe(0);
  });

  test("should return 0 when returned before due date", () => {
    const fine = calculateFine(
      "2026-10-11",
      "2026-10-10"
    );

    expect(fine).toBe(0);
  });

  test("should calculate ₹10 for 1 day late", () => {
    const fine = calculateFine(
      "2026-10-11",
      "2026-10-12"
    );

    expect(fine).toBe(10);
  });

  test("should calculate ₹40 for 4 days late", () => {
    const fine = calculateFine(
      "2026-10-11",
      "2026-10-15"
    );

    expect(fine).toBe(40);
  });

  test("should calculate ₹100 for 10 days late", () => {
    const fine = calculateFine(
      "2026-10-11",
      "2026-10-21"
    );

    expect(fine).toBe(100);
  });

});