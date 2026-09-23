import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env.js';

let transporter;
let resendClient;

function getResend() {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

function getTransporter() {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  return transporter;
}

/** Resend's sandbox sender. Built in parts so the domain cannot get rewritten. */
function resendSandboxFrom() {
  return `LUMEN <onboarding@${['resend', 'dev'].join('.')}>`;
}

function defaultFrom() {
  const configured = env.RESEND_FROM || env.SMTP_FROM || '';
  if (configured && !/@example\.com\s*>?$/i.test(configured)) {
    return configured;
  }
  return resendSandboxFrom();
}

function logToConsole({ to, subject, text }) {
  console.warn('[mail] No email provider configured — logged to console');
  console.warn(`[mail] To: ${to}`);
  console.warn(`[mail] Subject: ${subject}`);
  console.warn(`[mail] ${text}`);
  return { logged: true };
}

export async function sendMail({ to, subject, text, html }) {
  const from = defaultFrom();
  const resend = getResend();

  if (resend) {
    const { data, error } = await resend.emails.send({ from, to, subject, text, html });
    if (error) {
      const detail = error.message || JSON.stringify(error);
      console.error('[mail] Resend failed:', detail);
      console.warn('[mail] Falling back to console. Free Resend only delivers to your Resend-account email.');
      return logToConsole({ to, subject, text });
    }
    console.log(`[mail] Resend sent ${data?.id || ''} to ${to}`);
    return { sent: true, provider: 'resend', id: data?.id };
  }

  const tx = getTransporter();
  if (tx) {
    await tx.sendMail({ from, to, subject, text, html });
    return { sent: true, provider: 'smtp' };
  }

  return logToConsole({ to, subject, text });
}

export async function sendPasswordResetOtp({ to, otp, name }) {
  const subject = 'Your LUMEN password reset code';
  const text = `Hi ${name || 'there'},\n\nYour password reset code is ${otp}.\nIt expires in 10 minutes.\n\nIf you did not request this, ignore this email.\n\n— LUMEN`;
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
      <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#888">LUMEN</p>
      <h1 style="font-size:22px;margin:12px 0">Password reset</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Use this code to reset your password:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:0.25em;margin:24px 0">${otp}</p>
      <p style="color:#666;font-size:14px">Expires in 10 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;
  return sendMail({ to, subject, text, html });
}
