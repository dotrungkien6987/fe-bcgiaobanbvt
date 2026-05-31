export const PASSWORD_POLICY_HINT =
  "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt, đồng thời không thuộc nhóm mật khẩu yếu phổ biến.";

const COMMON_WEAK_PASSWORDS = [
  "123456",
  "password",
  "admin",
  "12345678",
  "123456789",
];

export function getPasswordPolicyError(password) {
  if (typeof password !== "string" || password.length === 0) {
    return "Mật khẩu không hợp lệ";
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isWeakPassword = COMMON_WEAK_PASSWORDS.includes(password.toLowerCase());

  if (
    !hasMinLength ||
    !hasUppercase ||
    !hasLowercase ||
    !hasDigit ||
    !hasSpecialChar ||
    isWeakPassword
  ) {
    return PASSWORD_POLICY_HINT;
  }

  return null;
}

export function buildStrongPasswordSchema(Yup, requiredMessage) {
  return Yup.string()
    .required(requiredMessage)
    .test("strong-password", PASSWORD_POLICY_HINT, (value) => {
      if (!value) {
        return true;
      }

      return !getPasswordPolicyError(value);
    });
}
