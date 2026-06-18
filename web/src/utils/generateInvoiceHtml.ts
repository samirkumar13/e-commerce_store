import { Order } from '../types';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  PENDING_PAYMENT: 'Pending Payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_PENDING: 'Return Pending',
  RETURN_APPROVED: 'Return Approved',
  RETURN_REJECTED: 'Return Rejected',
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  DELIVERED:        { bg: '#dcfce7', text: '#15803d' },
  SHIPPED:          { bg: '#dbeafe', text: '#1d4ed8' },
  PROCESSING:       { bg: '#fef9c3', text: '#854d0e' },
  CANCELLED:        { bg: '#fee2e2', text: '#b91c1c' },
  PENDING:          { bg: '#f1f5f9', text: '#475569' },
  PENDING_PAYMENT:  { bg: '#f1f5f9', text: '#475569' },
  RETURN_PENDING:   { bg: '#fef9c3', text: '#854d0e' },
  RETURN_APPROVED:  { bg: '#f3e8ff', text: '#7e22ce' },
  RETURN_REJECTED:  { bg: '#fee2e2', text: '#b91c1c' },
};

export function generateInvoiceHtml(
  order: Order,
  settings: Record<string, string>,
  returnStatus?: string,
): string {
  const storeName    = settings.storeName    || 'Store';
  const storeAddress = settings.storeAddress || '';
  const storeEmail   = settings.storeEmail   || '';
  const storePhone   = settings.storePhone   || '';
  const gstNumber    = settings.gstNumber    || '';
  const storePAN     = settings.storePAN     || '';
  const taxRate      = parseFloat(settings.taxRate || '0');
  const invoiceTerms = settings.invoiceTerms || '';

  const subTotal       = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount       = order.discountAmount || 0;
  const walletDiscount = (order as any).walletDiscount || 0;
  const taxableAmount  = Math.max(0, subTotal - discount - walletDiscount);
  const taxAmount      = (taxableAmount * taxRate) / 100;
  const cgst           = taxAmount / 2;
  const sgst           = taxAmount / 2;
  const grandTotal     = taxableAmount + taxAmount;

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const invoiceNo = `INV-${order.id.slice(-8).toUpperCase()}`;

  // Determine effective status — return takes priority over order status
  const effectiveStatus = returnStatus
    ? `RETURN_${returnStatus}`
    : (order.status || 'PENDING');

  const statusLabel = STATUS_LABEL[effectiveStatus] || effectiveStatus;
  const statusStyle = STATUS_COLOR[effectiveStatus] || STATUS_COLOR.PENDING;

  const trackingNumber = (order as any).trackingNumber;
  const awbCode        = (order as any).awbCode;

  const itemRows = order.items.map(item => {
    const lineTotal   = item.price * item.quantity;
    const lineTax     = taxRate > 0 ? (lineTotal / (1 + taxRate / 100)) * (taxRate / 100) : 0;
    const lineTaxable = lineTotal - lineTax;
    return `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">${item.product.name}${item.variantName ? `<br/><span style="font-size:11px;color:#64748b;">${item.variantName}</span>` : ''}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">₹${item.price.toFixed(2)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">₹${lineTaxable.toFixed(2)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${taxRate}%</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">₹${lineTax.toFixed(2)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">₹${lineTotal.toFixed(2)}</td>
      </tr>`;
  }).join('');

  const shippingAddr = [
    (order as any).shippingAddress,
    (order as any).city,
    (order as any).state,
    (order as any).pincode,
  ].filter(Boolean).join(', ');

  const termsHtml = invoiceTerms
    ? `<div class="terms-section">
        <h4>Terms &amp; Conditions</h4>
        <p>${invoiceTerms.replace(/\n/g, '<br/>')}</p>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Tax Invoice – ${invoiceNo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1e293b; background: #fff; }
  .page { width: 794px; min-height: 1123px; margin: 0 auto; padding: 48px; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #0891b2; margin-bottom: 24px; }
  .store-name { font-size: 22px; font-weight: 700; color: #0e7490; }
  .store-info { font-size: 11px; color: #64748b; margin-top: 6px; line-height: 1.6; }
  .invoice-title { text-align: right; }
  .invoice-title h2 { font-size: 20px; font-weight: 700; color: #1e293b; letter-spacing: 1px; }
  .invoice-title p { font-size: 12px; color: #64748b; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
  .meta-box h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #94a3b8; margin-bottom: 8px; }
  .meta-box p { font-size: 12px; color: #334155; line-height: 1.7; }
  .meta-box strong { color: #0e7490; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead { background: #0e7490; color: #fff; }
  thead th { padding: 10px 8px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
  thead th:not(:first-child) { text-align: center; }
  thead th:last-child, thead th:nth-child(4), thead th:nth-child(6) { text-align: right; }
  .totals { margin-top: 20px; display: flex; justify-content: flex-end; }
  .totals-table { width: 300px; font-size: 12px; }
  .totals-table td { padding: 5px 8px; }
  .totals-table td:last-child { text-align: right; font-weight: 600; }
  .totals-table .grand { font-size: 14px; font-weight: 700; color: #0e7490; border-top: 2px solid #0e7490; padding-top: 8px; }
  .status-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; margin-top: 6px; }
  .paid-badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; vertical-align: middle; }
  .terms-section { margin-top: 36px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
  .terms-section h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #94a3b8; margin-bottom: 10px; }
  .terms-section p { font-size: 11px; color: #475569; line-height: 1.7; }
  .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
    .page { width: 100%; padding: 20px; }
  }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div>
      <div class="store-name">${storeName}</div>
      <div class="store-info">
        ${storeAddress ? storeAddress + '<br/>' : ''}
        ${storeEmail  ? 'Email: ' + storeEmail + '<br/>' : ''}
        ${storePhone  ? 'Phone: ' + storePhone + '<br/>' : ''}
        ${gstNumber   ? '<strong>GSTIN: ' + gstNumber + '</strong><br/>' : ''}
        ${storePAN    ? 'PAN: ' + storePAN : ''}
      </div>
    </div>
    <div class="invoice-title">
      <h2>TAX INVOICE</h2>
      <p style="margin-top:8px;"><strong>${invoiceNo}</strong></p>
      <p>Date: ${invoiceDate}</p>
      <div style="margin-top:8px;">
        <span class="status-badge" style="background:${statusStyle.bg};color:${statusStyle.text};">
          ${statusLabel.toUpperCase()}
        </span>
        ${order.paymentStatus === 'PAID' ? '<span class="paid-badge" style="margin-left:6px;">PAID</span>' : ''}
      </div>
      ${trackingNumber ? `<p style="margin-top:6px;font-size:11px;">Tracking: <strong>${trackingNumber}</strong></p>` : ''}
      ${awbCode        ? `<p style="font-size:11px;">AWB: <strong>${awbCode}</strong></p>` : ''}
    </div>
  </div>

  <!-- Meta -->
  <div class="meta">
    <div class="meta-box">
      <h4>Bill To</h4>
      <p>
        <strong>${order.user?.name || 'Customer'}</strong><br/>
        ${order.user?.email || ''}<br/>
        ${(order as any).phone || ''}
      </p>
    </div>
    <div class="meta-box">
      <h4>Ship To</h4>
      <p>${shippingAddr || '—'}</p>
    </div>
  </div>

  <!-- Items table -->
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Item</th>
        <th>Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Taxable Amt</th>
        <th>GST %</th>
        <th style="text-align:right;">GST Amt</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <table class="totals-table">
      <tr><td style="color:#64748b;">Sub Total</td><td>₹${subTotal.toFixed(2)}</td></tr>
      ${discount > 0 ? `<tr><td style="color:#16a34a;">Coupon Discount${order.couponCode ? ' (' + order.couponCode + ')' : ''}</td><td style="color:#16a34a;">− ₹${discount.toFixed(2)}</td></tr>` : ''}
      ${walletDiscount > 0 ? `<tr><td style="color:#0891b2;">Wallet / Points</td><td style="color:#0891b2;">− ₹${walletDiscount.toFixed(2)}</td></tr>` : ''}
      ${taxRate > 0 ? `<tr><td style="color:#64748b;">Taxable Amount</td><td>₹${taxableAmount.toFixed(2)}</td></tr>` : ''}
      ${taxRate > 0 ? `<tr><td style="color:#64748b;">CGST (${(taxRate / 2).toFixed(1)}%)</td><td>₹${cgst.toFixed(2)}</td></tr>` : ''}
      ${taxRate > 0 ? `<tr><td style="color:#64748b;">SGST (${(taxRate / 2).toFixed(1)}%)</td><td>₹${sgst.toFixed(2)}</td></tr>` : ''}
      <tr class="grand"><td>Grand Total</td><td>₹${grandTotal.toFixed(2)}</td></tr>
    </table>
  </div>

  ${termsHtml}

  <!-- Footer -->
  <div class="footer">
    <div>This is a computer-generated invoice and does not require a physical signature.</div>
    <div>Thank you for shopping with ${storeName}!</div>
  </div>
</div>
</body>
</html>`;
}
