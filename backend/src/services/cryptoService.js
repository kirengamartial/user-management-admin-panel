const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class CryptoService {
  constructor() {
    this.privateKeyPath = path.join(__dirname, '../keys/private.pem');
    this.publicKeyPath = path.join(__dirname, '../keys/public.pem');
  }

  hashEmail(email) {
    return crypto.createHash('sha384').update(email).digest('hex');
  }

  signHash(hash) {
    try {
      const privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');
      const sign = crypto.createSign('RSA-SHA384');
      sign.update(hash);
      sign.end();
      return sign.sign(privateKey, 'base64');
    } catch (error) {
      throw new Error('Private key not found. Please run: npm run generate-keys');
    }
  }

  getPublicKey() {
    try {
      return fs.readFileSync(this.publicKeyPath, 'utf8');
    } catch (error) {
      throw new Error('Public key not found. Please run: npm run generate-keys');
    }
  }

  verifySignature(hash, signature) {
    try {
      const publicKey = this.getPublicKey();
      const verify = crypto.createVerify('SHA384');
      verify.update(hash);
      verify.end();
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      return false;
    }
  }
}

module.exports = new CryptoService();
