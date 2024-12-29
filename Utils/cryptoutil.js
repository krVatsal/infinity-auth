const crypto = require("crypto");
const { ENCRYPTION_KEY } = require("../config/main");

const iv = crypto.randomBytes(16).toString("hex");

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, "hex")
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return Buffer.from(encrypted, 'hex').toString('base64');
}

// AES-CTR decryption function
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, "hex")
  );
  const encryptedHex = Buffer.from(encryptedText, 'base64').toString('hex');
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function generateRandomString() {
  // Generate a random string
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const length = 32;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

module.exports = {
  encrypt,
  decrypt,
  generateRandomString,
};
