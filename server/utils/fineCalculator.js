function calculateFine(dueDate, returnDate) {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  // No fine if returned on or before due date
  if (returned <= due) {
    return 0;
  }

  const differenceInMilliseconds = returned - due;

  const daysLate = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60 * 24)
  );

  return daysLate * 10;
}

module.exports = calculateFine;