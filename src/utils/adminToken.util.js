import { createHash, createHmac, timingSafeEqual } from 'crypto';

import { ADMIN_PASSWORD } from '#config/environment.config';

/**
 * Sesión del panel administrativo (2026-10-01): la contraseña solo la conoce
 * el backend (ADMIN_PASSWORD). Al iniciar sesión se entrega un token firmado
 * con HMAC que vence; cambiar la contraseña invalida todas las sesiones.
 */
export const ADMIN_SESSION_HOURS = 8;

const sha256 = (value) => createHash('sha256').update(String(value)).digest();

// Clave de firma derivada de la contraseña
const signingKey = () => sha256(`fundacion-admin-token:${ADMIN_PASSWORD ?? ''}`);

const sign = (payload) => createHmac('sha256', signingKey()).update(payload).digest('base64url');

export const isAdminConfigured = () => Boolean(ADMIN_PASSWORD);

/** Compara en tiempo constante (no revela cuántos caracteres coinciden). */
export const checkAdminPassword = (password) => isAdminConfigured() &&
  timingSafeEqual(sha256(password ?? ''), sha256(ADMIN_PASSWORD));

/** @returns {{token: string, expiresAt: string}} */
export const createAdminToken = (now = Date.now()) => {
  const exp = now + ADMIN_SESSION_HOURS * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(exp).toISOString() };
};

export const verifyAdminToken = (token, now = Date.now()) => {
  if (!isAdminConfigured() || typeof token !== 'string') return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > now;
  } catch {
    return false;
  }
};
