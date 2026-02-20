export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password) {
  const errors = [];

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    errors.push('passwordMinLength');
  }
  if (password && password.includes(' ')) {
    errors.push('passwordNoSpaces');
  }
  if (!password || !/[A-Z]/.test(password)) {
    errors.push('passwordUppercase');
  }
  if (!password || !/[a-z]/.test(password)) {
    errors.push('passwordLowercase');
  }
  if (!password || !/\d/.test(password)) {
    errors.push('passwordDigit');
  }
  if (!password || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~`]/.test(password)) {
    errors.push('passwordSpecial');
  }

  return errors;
}

export function getPasswordStrength(password) {
  if (!password) return 0;

  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~`]/.test(password)) score++;

  if (score <= 2) return 1; // weak
  if (score <= 4) return 2; // medium
  return 3; // strong
}
