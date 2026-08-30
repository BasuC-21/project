const sendOtpEmail = async (email, otp) => {
    try {
        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    sender: {
                        name: "EduTube",
                        email: process.env.BREVO_SENDER_EMAIL,
                    },
                    to: [
                        {
                            email: email,
                        },
                    ],
                    subject: "EduTube Email Verification OTP",
                    textContent: `Your EduTube verification code is ${otp}. This code expires in 10 minutes.`,
                    htmlContent: `
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

                            <p>— EduTube</p>
                        </div>
                    `,
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("Brevo email failed:", result);
            throw new Error(
                result.message || "Failed to send OTP email"
            );
        }

        console.log(
            "OTP email sent successfully to:",
            email
        );

        return result;

    } catch (error) {
        console.error(
            "OTP email failed:",
            error.message
        );

        throw error;
    }
};

export {
    sendOtpEmail,
};