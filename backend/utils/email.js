import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send Transfer OTP
 */
export const sendTransferOTP = async ({
    email,
    fullName,
    otp,
    amount,
    receiverAccount,
}) => {

    const mailOptions = {
        from: `"AegisBank Security" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "AegisBank Secure Transfer OTP",

        html: `
        <div style="font-family:Arial,sans-serif;padding:30px">

            <h2 style="color:#1d4ed8">
                AegisBank
            </h2>

            <h3>Secure Transfer Verification</h3>

            <p>Hello <b>${fullName}</b>,</p>

            <p>
                You requested a bank transfer.
            </p>

            <table style="border-collapse:collapse">

                <tr>
                    <td><b>Amount</b></td>
                    <td style="padding-left:20px">₹${amount}</td>
                </tr>

                <tr>
                    <td><b>Receiver</b></td>
                    <td style="padding-left:20px">${receiverAccount}</td>
                </tr>

            </table>

            <br>

            <div
                style="
                    font-size:36px;
                    font-weight:bold;
                    letter-spacing:8px;
                    color:#2563eb;
                "
            >
                ${otp}
            </div>

            <br>

            <p>
                This OTP is valid for
                <b>5 minutes</b>.
            </p>

            <p style="color:red">
                Never share this OTP with anyone.
            </p>

            <hr>

            <small>
                AegisBank Security Team
            </small>

        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};