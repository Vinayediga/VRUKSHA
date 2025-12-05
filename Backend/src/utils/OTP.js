function generateOTP() {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a random number between 100000 and 999999
    return otp;
  }
  
  // Example usage:

export default generateOTP