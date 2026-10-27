import crypto from 'node:crypto';

export function createAccessTokenPayload(userId: string, sessionId: string) {
  return { sub: userId, sessionId };
}

export function generateNumericCode(prefix: string, length = 6) {
  const random = crypto.randomInt(0, 10 ** length).toString().padStart(length, '0');
  return `${prefix}-${random}`;
}

export function generateQrToken() {
  return `ITEM-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

export function toDecimal(value: number | string) {
  return value.toString();
}
