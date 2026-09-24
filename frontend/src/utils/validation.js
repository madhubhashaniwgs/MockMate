const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const validateName = (name) => {
  const value = name.trim();

  if (value.length < 2) return "Name must contain at least 2 characters.";
  if (value.length > 80) return "Name must be 80 characters or fewer.";
  return "";
};

export const validateEmail = (email) => {
  const value = email.trim();

  if (!emailPattern.test(value)) return "Please enter a valid email address.";
  if (value.length > 254) return "Email address is too long.";
  return "";
};

export const validatePassword = (password) => {
  if (!passwordPattern.test(password)) {
    return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
  }

  return "";
};
