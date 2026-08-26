import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"EduTube" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "EduTube Email Verification OTP",
        text: `Your EduTube verification code is ${otp}. This code expires in 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2>EduTube Email Verification</h2>

                <p>
                    Use the following OTP to verify your email address:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin: 25px 0;
                ">
                    ${otp}
                </div>

                <p>
                    This OTP expires in <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not request this verification, you can ignore this email.
                </p>

                <p>
                    — EduTube
                </p>
            </div>
        `,
    });
};

export {
    sendOtpEmail,
};