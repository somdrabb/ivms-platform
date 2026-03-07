// src/utils/password.js
import crypto from 'crypto';

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';

export function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(plain, salt, ITERATIONS, KEYLEN, DIGEST)
    .toString('hex');
  return { salt, hash };
}

export function verifyPassword(plain, salt, expectedHash) {
  if (!salt || !expectedHash) return false;
  const derived = crypto
    .pbkdf2Sync(plain, salt, ITERATIONS, KEYLEN, DIGEST)
    .toString('hex');
  return crypto.timingSafeEqual(
    Buffer.from(derived, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}
