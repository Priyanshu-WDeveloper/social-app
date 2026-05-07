const resetPasswordTemplate = (resetUrl, fullName) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>

      <p>Hello ${fullName || 'User'},</p>

      <p>
        You requested a password reset.
      </p>

      <p>
        Click the button below to reset your password.
      </p>

      <a
        href="${resetUrl}"
        style="
          display: inline-block;
          padding: 12px 20px;
          background: black;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 10px;
        "
      >
        Reset Password
      </a>

      <p style="margin-top: 20px;">
        If you did not request this,
        please ignore this email.
      </p>
    </div>
  `;
};
export default resetPasswordTemplate;
