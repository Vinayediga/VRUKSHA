import { createTransport } from "nodemailer";
import generateOTP from "./OTP.js";
import { ApiError } from "./ApiError.js";


const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: "v4orgegames@gmail.com",        
    pass: "fzfw yblx jmsf hqwh"
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});


const SendEmail_for_Verification = async(email,otp)=>{
  
   try {
     const info = await transporter.sendMail({
         from: '"Vforge 👻" <v4orgegames@gmail.com>', // sender address
         to: `${email}`, // list of receivers
         subject: "OTP verification ", // Subject line
         html: `
         <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
           <h2 style="color: #4F46E5;">Vforge Games - OTP Verification</h2>
           <p>Hi there,</p>
           <p>Here is your OTP:</p>
           <div style="background-color: #f3f4f6; padding: 10px; border-left: 4px solid #4F46E5; margin: 20px 0;">
             <p style="margin: 0;">${otp}</p>
           </div>
           <p>Thank you,<br><strong>Vforge Games Team</strong></p>
         </div>
       ` // plain text body
       
       });
       console.log(info);
       
       console.log("Message sent: %s", info.messageId);
       return info.messageId
   } catch (error) {
       console.log("nodemailer error:",error);
       
   }
      
}

const SendMssg = async (email,query)=>{
    if(!email){
        throw new ApiError(400,"email is Required")
    }
    try {
        const info = await transporter.sendMail({
            from: `${email}`, // sender address
            to: `v4orgegames@gmail.com`, // list of receivers
            subject: "User query", // Subject line
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
              <h2 style="color: #4F46E5;">Vforge Games - User query</h2>
              <p>Hi there,</p>
              <div style="background-color: #f3f4f6; padding: 10px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                <p style="margin: 0;">${query}</p>
              </div>
            </div>
          ` // plain text body
          
          });
          console.log(info);
          
          console.log("Message sent: %s", info.messageId);
          return info.messageId
      } catch (error) {
          console.log("nodemailer error:",error);
          
      }


}

const sendUPdatedCcountDetails = async (email, query) => {
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  try {
    const info = await transporter.sendMail({
      from: '"Vforge Games" <v4orgegames@gmail.com>', // sender address
      to: `${email}`, // receiver
      subject: "Account Update Notification", // Subject line

      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #4F46E5;">Vforge Games - Account Update</h2>
          <p>Hi there,</p>
          <p>We've made some important changes to your account. Here are the details:</p>
          <div style="background-color: #f3f4f6; padding: 10px; border-left: 4px solid #4F46E5; margin: 20px 0;">
            <p style="margin: 0;">${query}</p>
          </div>
          <p>If you have any concerns or didn't request this change, please contact us immediately.</p>
          <p>Thank you,<br><strong>Vforge Games Team</strong></p>
        </div>
      `
    });

    console.log("Message sent: %s", info.messageId);
    return info.messageId;

  } catch (error) {
    console.log("Nodemailer error:", error);
  }
};


export  {SendEmail_for_Verification,SendMssg,sendUPdatedCcountDetails}
