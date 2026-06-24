import CryptoJS from "crypto-js";

// Secret key for encryption (keep it secret and safe)
const secretKey = "mySecretKey";

// Function to encrypt data
function encryptData(data) {
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey
  ).toString();
  console.log("encrypted is id is", ciphertext);
  return ciphertext;
}

// Function to decrypt data
function decryptData(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    if (bytes.toString()) {
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      console.log("dencrypted is id is", decryptedData);

      return decryptedData;
    }
    return null;
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
}

export { encryptData, decryptData };
