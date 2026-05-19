
exports.generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}

exports.getotpHtml = (otp) => {
    return `
        <h1>Your OTP for email verification is: ${otp}</h1>       
        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
    `
}