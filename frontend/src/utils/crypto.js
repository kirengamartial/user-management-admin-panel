export async function hashEmail(email) {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-384', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifySignature(email, signature, publicKeyPem) {
  try {
    const emailHash = await hashEmail(email);
    const publicKey = await importPublicKey(publicKeyPem);
    const signatureBuffer = base64ToArrayBuffer(signature);
    const encoder = new TextEncoder();
    const hashBuffer = encoder.encode(emailHash);

    const isValid = await crypto.subtle.verify(
      {
        name: 'RSASSA-PKCS1-v1_5',
      },
      publicKey,
      signatureBuffer,
      hashBuffer
    );

    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function importPublicKey(pem) {
  const pemContents = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');

  const binaryDer = base64ToArrayBuffer(pemContents);

  return await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-384',
    },
    true,
    ['verify']
  );
}

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
