export function validateBid({amount, total, selected, choice, newChoice}) {
  if (amount <= 0) {
    return [false, 'Amount must be greater than 0.'];
  }

  if (amount > total) {
    return [false, `Amount cannot be greater than $${total}.`];
  }

  if (!selected || selected.goal) {
    return [true, null];
  }

  if (newChoice && !newOptionValue) {
    return [false, 'Must enter new option.'];
  }

  if (!newOption && !selectedChoice) {
    return [false, 'Must pick an option.'];
  }

  return [true, null];
}
