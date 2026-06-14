import { Resend } from 'resend';
import config from '../config';

const resend = new Resend(config.resend.apiKey);
const FROM = config.resend.fromEmail;

export const sendPasswordResetEmail = async (to: string, name: string, resetUrl: string) => {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#0891b2">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0891b2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#64748b;font-size:13px">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
        <p style="color:#64748b;font-size:13px">Or copy this link: ${resetUrl}</p>
      </div>
    `,
  });
};

export const sendOrderConfirmationEmail = async (
  to: string,
  name: string,
  orderId: string,
  items: { name: string; quantity: number; price: number }[],
  total: number,
) => {
  const itemRows = items
    .map(i => `<tr><td style="padding:6px 0">${i.name}</td><td style="padding:6px 0;text-align:right">x${i.quantity}</td><td style="padding:6px 0;text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td></tr>`)
    .join('');

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#0891b2">Order Confirmed!</h2>
        <p>Hi ${name}, thank you for your order.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="border-bottom:2px solid #e2e8f0">
            <th style="text-align:left;padding:6px 0">Item</th>
            <th style="text-align:right;padding:6px 0">Qty</th>
            <th style="text-align:right;padding:6px 0">Amount</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr style="border-top:2px solid #e2e8f0;font-weight:700">
            <td colspan="2" style="padding:8px 0">Total</td>
            <td style="padding:8px 0;text-align:right">₹${total.toFixed(2)}</td>
          </tr></tfoot>
        </table>
        <p style="color:#64748b;font-size:13px">Order ID: #${orderId.slice(-8).toUpperCase()}</p>
        <a href="${config.frontendUrl}/#/account" style="display:inline-block;margin:8px 0;padding:10px 20px;background:#0891b2;color:#fff;border-radius:8px;text-decoration:none;font-size:14px">View My Orders</a>
      </div>
    `,
  });
};

export const sendOrderStatusEmail = async (
  to: string,
  name: string,
  orderId: string,
  status: string,
  trackingNumber?: string,
) => {
  const statusLabel: Record<string, string> = {
    PROCESSING: 'being processed',
    SHIPPED: 'on its way',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };
  const label = statusLabel[status] || status.toLowerCase();

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your order is ${label} — #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#0891b2">Order Update</h2>
        <p>Hi ${name},</p>
        <p>Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> is now <strong>${label}</strong>.</p>
        ${trackingNumber ? `<p>Tracking number: <strong>${trackingNumber}</strong></p>` : ''}
        <a href="${config.frontendUrl}/#/account" style="display:inline-block;margin:16px 0;padding:10px 20px;background:#0891b2;color:#fff;border-radius:8px;text-decoration:none;font-size:14px">Track My Order</a>
        <p style="color:#64748b;font-size:13px">If you have questions, reply to this email.</p>
      </div>
    `,
  });
};
