// const tls = require('tls');
// const fs = require('fs');
// class SMTPClient {

//     constructor(host, options = {})
//     {
//         this.host = host;
//         this.port = options.port || 465;
//         this.username = options.username;
//         this.password = options.password;
//         this.debug = options.debug || false;
//     }

//     async connect()
//     {
//         return new Promise((resolve, reject) => {
//             const options = {
//                 host: this.host,
//                 port: this.port,
//                 rejectUnauthorized: true,
//                 key: fs.readFileSync('C:\\Users\\Abhirup\\key.pem'),
//                 cert: fs.readFileSync('C:\\Users\\Abhirup\\cert.pem'),
//                 //maxVersion:'TLSv1.2',

//        // Maximum TLS version
           
//                 ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
//             };

//             this.socket = tls.connect(options, () => {
//                 if (this.debug) {
//                     console.log('SSL/TLS connection established');
//                     console.log('Protocol version:', this.socket.getProtocol());
//                 }
//                 resolve();
//             });

//             this.socket.on('error', (err) => {
//                 if (this.debug) {
//                     console.error('Socket error:', err);
//                 }
//                 reject(err);
//             });

//             if (this.debug) {
//                 this.socket.on('data', (data) => {
//                     console.log('recieved', data.toString().trim());

//                 });
//             }
//         });
//     }
//     async sendCommand(command)
//     {
//         return new Promise((resolve, reject) => {
            
//             if (this.debug && command.substring(0, 4) !== 'AUTH')
//             {
//                 console.log('Sending: ', command);
//             }
//             this.socket.write(command + '\r\n');
//             this.socket.once('data', (data) => {
//                 const response = data.toString();
//                 const code = parseInt(response.substring(0, 3));
//                 if (code >= 200 & code < 400)
//                 {
//                     resolve(response)
//                 }
//                 else {
//                     reject(new Error(`SMTP Error: ${response}`));

//                 }
//             })
//         })
//     }

//     async authenticate()
//     {
//         if (!this.username || !this.password)
//         {
//             throw new Error('Authentication credentials not provided');

//         }
//         await this.sendCommand('AUTH LOGIN');

//         await this.sendCommand(Buffer.from(this.username).toString('base64'));

//     }

//     async sendMail(from, to, subject, body)
//     {
//         try {
//             await this.connect();

//             await this.sendCommand('EHLO localhost');

//             if (this.username && this.password)
//             {
//                 await this.authenticate();

//             }
//             await this.sendCommand(`MAIL FROM:<${from}>`);
//             await this.sendCommand(`RCPT TO:<${to}>`);

//             await this.sendCommand('DATA');
//             const message = [
//                 `From: ${from}`,
//                 `To: ${To}`,
//                 `Subject: ${subject}`,
//                 'MIME-Version: 1.0',
//                 'Content-Type: text/plain; charset=utf-8',
//                 `Date: ${new Date().toUTCString()}`,
//                 '',
//                 body,
//                 '.',
//             ].join('\r\n');

//             await this.sendCommand(message);

//             await this.sendCommand('QUIT');
//             this.socket.end();

//             return true;

//         } catch (error)
//         {
//             this.socket?.end();
//             throw error;
//         }
//     }
// }


// module.exports = SMTPClient;

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



async function sendMail(data)
{
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: data.to,
            subject: data.subject,
            text: data.text,
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


module.exports = { sendMail };