// const nodemailer = require('nodemailer');
// const sendEmail =async (options) => {
//   // create a transporter
//   //   ! mailStrap
//   const transporter = nodemailer.createTransport({
//     host:process.env.EMAIL_HOST,
//     port:process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSOWRD,
//     },
//   });
//   //   !Gamil
//   //   const transporter = nodemailer.createTransport({
//   //     service: 'Gmail',
//   //     auth: {
//   //       user: process.env.EMAIL_USER,
//   //       pass: process.env.EMAIL_PASSOWRD,
//   //     },
//   //   });
//   // define the email options
//   const mailOptions={
//     from:'Jonas Schmedtmam <admin@gmail.com>',
//     to:options.email,
//     subject:options.subject,
//     text:options.message,
//   }
//   // actually send the email
//  await transporter.sendMail(mailOptions)
// };

// module.exports = sendEmail;

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('Sending email to:', options.message);
  // 1) Create a transporter
  //   const transporter = nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT,
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD
  //     }
  //   });

  //   7f6c0df7ea9847
  // 8314d41ea500bd
  var transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '7f6c0df7ea9847',
      pass: '8314d41ea500bd',
    },
  });
  // 2) Define the email options
  const mailOptions = {
    from: 'Jonas Schmedtmann <hello@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
