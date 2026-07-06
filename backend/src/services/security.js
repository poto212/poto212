import crypto from 'crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, originalHash] = stored.split(':');
  const hash = crypto.scryptSync(password, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }).toString('hex');
  if (Buffer.byteLength(hash, 'hex') !== Buffer.byteLength(originalHash, 'hex')) return false;
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

export function isHashedPassword(value) {
  return typeof value === 'string' && value.includes(':') && value.split(':').length === 2;
}
