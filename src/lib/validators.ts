export const isNumeric = (value: string): boolean => {
  if (value === "") return true; // Allow empty strings, Zod will handle required
  return /^[0-9]+$/.test(value);
};

export const isAlpha = (value: string): boolean => {
  if (value === "") return true;
  return /^[a-zA-Z\s]+$/.test(value); // Allows spaces for names like "John Doe"
};

export const isAlphaNumeric = (value: string): boolean => {
  if (value === "") return true;
  return /^[a-zA-Z0-9]+$/.test(value);
};
