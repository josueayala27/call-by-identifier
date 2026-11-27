// Purpose: the #core/identity surface: the sign-in use cases, the email normaliser and the port definitions.

export { requestCode, verifyCode, resolveSession, CODE_LIFETIME_MS, SESSION_LIFETIME_MS } from './signin';
export type { RequestCodeResult, VerifyCodeResult } from './signin';
export { normaliseEmail } from './email';
export type * from './ports';
