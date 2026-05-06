const otpTemplate = (name: string, otp: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 40px 0;
          }

          .container {
            max-width: 500px;
            margin: auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow:
              0 4px 12px rgba(0,0,0,0.08);
          }

          .logo {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }

          .title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .text {
            color: #555;
            line-height: 1.6;
          }

          .otp-box {
            margin: 30px 0;
            text-align: center;
          }

          .otp {
            display: inline-block;
            font-size: 34px;
            font-weight: bold;
            letter-spacing: 8px;
            background: #000;
            color: #fff;
            padding: 16px 28px;
            border-radius: 10px;
          }

          .footer {
            margin-top: 30px;
            color: #888;
            font-size: 14px;
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="logo">
            Social App
          </div>

          <div class="title">
            Verify Your Account
          </div>

          <p class="text">
            Hello ${name},
          </p>

          <p class="text">
            Use the OTP below to verify your account.
            This OTP will expire in 5 minutes.
          </p>

          <div class="otp-box">
            <div class="otp">
              ${otp}
            </div>
          </div>

          <p class="text">
            If you did not request this,
            please ignore this email.
          </p>

          <div class="footer">
            © 2026 Social App. All rights reserved.
          </div>

        </div>
      </body>
    </html>
  `;
};

export default otpTemplate;
