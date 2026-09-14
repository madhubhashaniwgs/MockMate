const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const validateName = (name) => {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "Name must contain at least 2 characters.";
  }

  if (name.trim().length > 80) {
    return "Name must be 80 characters or fewer.";
  }

  return "";
};

const validateEmail = (email) => {
  if (typeof email !== "string" || !emailPattern.test(email.trim())) {
    return "Please enter a valid email address.";
  }

  if (email.trim().length > 254) {
    return "Email address is too long.";
  }

  return "";
};

const validatePassword = (password) => {
  if (typeof password !== "string" || !passwordPattern.test(password)) {
    return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
  }

  return "";
};

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
};
