const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendWelcomeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: "riteshkhandelwal270@gmail.com",
    subject: "Thanks for joining the team",
    text: `Welcome to the team${name}. Hope you are liking it`,
  });
};
const sendExitMail = (email, name) => {
  sgMail.send({
    to: email,
    from: "riteshkhandelwal270@gmail.com",
    subject: "Thanks for exiting the team",
    text: `Hope your experience was good${name}. Hope you liked it`,
  });
};
module.exports = {
  sendWelcomeMail: sendWelcomeMail,
  sendExitMail: sendExitMail,
};
