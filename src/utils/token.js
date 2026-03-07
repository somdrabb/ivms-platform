// src/utils/token.js
import crypto from 'crypto';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(data, secret) {
  return base64url(
    crypto.createHmac('sha256', secret).update(data).digest()
  );
}

export function generateToken(payload, { secret, expiresIn = '8h' }) {
  if (!secret) throw new Error('AUTH_SECRET is not configured');
  const header = { alg: 'HS256', typ: 'JWT' };
  const expSeconds = (() => {
    const match = String(expiresIn).match(/^(\d+)([smhd])$/i);
    if (!match) return Math.floor(Date.now() / 1000) + 60 * 60 * 8;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] || 3600;
    return Math.floor(Date.now() / 1000) + value * multiplier;
  })();
  const body = { ...payload, exp: expSeconds };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedBody = base64url(JSON.stringify(body));
  const signature = sign(`${encodedHeader}.${encodedBody}`, secret);
  return `${encodedHeader}.${encodedBody}.${signature}`;
}

export function verifyToken(token, secret) {
  if (!token || !secret) return null;
  const [encodedHeader, encodedBody, signature] = token.split('.');
  if (!encodedHeader || !encodedBody || !signature) return null;
  const expectedSignature = sign(`${encodedHeader}.${encodedBody}`, secret);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }
  const payload = JSON.parse(
    Buffer.from(encodedBody, 'base64').toString('utf8')
  );
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}
