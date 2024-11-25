
// module.exports = SMTPClient;
const { v4: uuid } = require('uuid');
const nodemailer = require('nodemailer');
const { removeUser, getUsersV,setUserInfo,addToken, deleteToken } = require('db-handler');
//const verificationToken = require('../database/models/verificationToken');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



async function sendMail(data,User, VerificationToken)
{
  try {
    const { verificationCode, token } = createVerificationEntry(data.username,User,VerificationToken);
    const link = (process.env.BASE_URL || 'http://localhost:8080') + '/verify?token='+ token+'&code='+verificationCode;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: data.to,
            subject: data.subject,
            text: link,
            //html: html // Optional HTML content
    };
        const info = await transporter.sendMail(mailOptions);
        return info;
    }
    catch (err)
    {
        console.error('Error sending mail!', err);
        throw err;
    }
}


let verificationTokens = {};

function generateVerificationCode() {
    console.log('email verification code = '+Math.floor(100000 + Math.random() * 900000).toString())
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  async function createVerificationEntry(userId,User,VerificationToken) {
    const verificationCode = generateVerificationCode();
    const token = uuid();
    
    // Store verification details
    // verificationTokens[userId] = {
    //   email,
    //   code: verificationCode,
    //   token,
    //   createdAt: Date.now()
    // };
    const result = await addToken(userId,token, verificationCode, VerificationToken)

    // Set timer to check and potentially remove unverified user
    startVerificationTimer(userId,User, VerificationToken);

    return { verificationCode, token };
  }

  function startVerificationTimer(userId,User,VerificationToken) {
  const VERIFICATION_TIMEOUT = 0.5 * 60 * 1000;
  
  const cleanupCallback = async function(User) {
    try {
      const user = await getUsersV(userId,User);
      
      if (!user.dataValues) {
        console.log(`User ${userId} not found`);
        return;
      }
      
      if (!user.dataValues.verified) {
        await deleteToken({username:userId}, VerificationToken)
        await removeUser(userId,User);
        //delete verificationTokens[userId];
        console.log(`Removed unverified user ${userId}`);
      }
    } catch (error) {
      console.error('Verification cleanup error:', error);
    }
  }.bind(null, User,VerificationToken);

  setTimeout(cleanupCallback, VERIFICATION_TIMEOUT);
}


  async function verifyEmail(token, code, User) {
    const verificationEntry = verificationTokens[token];
    
    if (!verificationEntry) {
      throw new Error('No verification entry found');
    }

    if (verificationEntry.code !== code) {
      throw new Error('Invalid verification code');
    }

    // Mark user as verified
    const user = await setUserInfo('asd123', {verified:true},User);
 

    // Clean up verification token
    //delete verificationTokens[token];

    return true;
  }

module.exports = { sendMail,generateVerificationCode,startVerificationTimer,verifyEmail };