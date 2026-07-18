const twilio = require("twilio");

function getClient() {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_VERIFY_SERVICE_SID
  ) {
    throw new Error(
      "Twilio Verify is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_VERIFY_SERVICE_SID."
    );
  }

  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

async function sendMobileOtp(phone) {
  return getClient()
    .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phone,
      channel: "sms",
    });
}

async function checkMobileOtp(phone, code) {
  return getClient()
    .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phone,
      code,
    });
}

module.exports = { sendMobileOtp, checkMobileOtp };
