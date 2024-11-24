
// module.exports = SMTPClient;
const { v4: uuid } = require('uuid');
const nodemailer = require('nodemailer');
const { removeUser, getUsersV,setUserInfo } = require('db-handler');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



async function sendMail(data,User)
{
  try {
    const { verificationCode, token } = createVerificationEntry(data.username, data.to,User);
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


const verificationTokens = {};

function generateVerificationCode() {
    console.log('email verification code = '+Math.floor(100000 + Math.random() * 900000).toString())
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  function createVerificationEntry(userId, email,User) {
    const verificationCode = generateVerificationCode();
    const token = uuid();
    
    // Store verification details
    verificationTokens[userId] = {
      email,
      code: verificationCode,
      token,
      createdAt: Date.now()
    };

    // Set timer to check and potentially remove unverified user
    startVerificationTimer(userId,User);

    return { verificationCode, token };
  }

  function startVerificationTimer(userId, User) {
  const VERIFICATION_TIMEOUT = 3 * 60 * 1000;
  
  const cleanupCallback = async function(User) {
    try {
      const user = await getUsersV(userId,User);
      
      if (!user.dataValues) {
        console.log(`User ${userId} not found`);
        return;
      }
      
      if (!user.dataValues.verified) {
        await removeUser(userId,User);
        delete verificationTokens[userId];
        console.log(`Removed unverified user ${userId}`);
      }
    } catch (error) {
      console.error('Verification cleanup error:', error);
    }
  }.bind(null, User);

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
    delete verificationTokens[token];

    return true;
  }

module.exports = { sendMail,generateVerificationCode,startVerificationTimer,verifyEmail };