export const generateAccountNumber = () => {
  // Generate random 10 digit number starting with a non-zero digit
  const firstDigit = Math.floor(Math.random() * 9) + 1; // 1-9
  const restDigits = Math.floor(100000000 + Math.random() * 900000000).toString(); // 9 digits
  return `${firstDigit}${restDigits.slice(0, 9)}`;
};

export const generateTransactionId = () => {
  const prefix = 'TXN';
  const timestamp = Date.now().toString();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp.slice(-8)}${randomChars}`;
};
