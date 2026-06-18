import { jsPDF } from 'jspdf';
import { Order } from '../types';

const C = {
  primary:    [8,   145, 178] as [number,number,number],
  primaryDark:[14,  116, 144] as [number,number,number],
  green:      [21,  128, 61 ] as [number,number,number],
  greenBg:    [220, 252, 231] as [number,number,number],
  blue:       [29,  78,  216] as [number,number,number],
  blueBg:     [219, 234, 254] as [number,number,number],
  amber:      [133, 77,  14 ] as [number,number,number],
  amberBg:    [254, 249, 195] as [number,number,number],
  red:        [185, 28,  28 ] as [number,number,number],
  redBg:      [254, 226, 226] as [number,number,number],
  purple:     [126, 34,  206] as [number,number,number],
  purpleBg:   [243, 232, 255] as [number,number,number],
  slate800:   [30,  41,  59 ] as [number,number,number],
  slate600:   [71,  85,  105] as [number,number,number],
  slate400:   [148, 163, 184] as [number,number,number],
  slate100:   [241, 245, 249] as [number,number,number],
  white:      [255, 255, 255] as [number,number,number],
};

const STATUS_STYLE: Record<string, { bg: [number,number,number]; text: [number,number,number]; label: string }> = {
  RETURN_PENDING:  { bg: C.amberBg,  text: C.amber,      label: 'RETURN PENDING'  },
  RETURN_APPROVED: { bg: C.purpleBg, text: C.purple,     label: 'RETURN APPROVED' },
  RETURN_REJECTED: { bg: C.redBg,    text: C.red,        label: 'RETURN REJECTED' },
  DELIVERED:       { bg: C.greenBg,  text: C.green,      label: 'DELIVERED'       },
  SHIPPED:         { bg: C.blueBg,   text: C.blue,       label: 'SHIPPED'         },
  PROCESSING:      { bg: C.amberBg,  text: C.amber,      label: 'PROCESSING'      },
  CANCELLED:       { bg: C.redBg,    text: C.red,        label: 'CANCELLED'       },
  PENDING:         { bg: C.slate100, text: C.slate600,   label: 'PENDING'         },
  PENDING_PAYMENT: { bg: C.slate100, text: C.slate600,   label: 'PENDING PAYMENT' },
};

// jsPDF built-in fonts don't support ₹ — use Rs. instead
const rs = (amount: number) => `Rs.${amount.toFixed(2)}`;
const rsMinus = (amount: number) => `- Rs.${amount.toFixed(2)}`;

function pill(doc: jsPDF, label: string, x: number, y: number, bg: [number,number,number], fg: [number,number,number]): number {
  doc.setFontSize(8);
  const w = doc.getTextWidth(label) + 8;
  const h = 7;
  doc.setFillColor(...bg);
  doc.roundedRect(x, y - 5.5, w, h, 2, 2, 'F');
  doc.setTextColor(...fg);
  doc.setFont('helvetica', 'bold');
  doc.text(label, x + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.slate800);
  return w + 3;
}

export function downloadInvoicePdf(
  order: Order,
  settings: Record<string, string>,
  returnStatus?: string,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const PW = 210;
  const ML = 12;
  const MR = 12;
  const CW = PW - ML - MR;

  const storeName    = settings.storeName    || 'Store';
  const storeAddress = settings.storeAddress || '';
  const storeEmail   = settings.storeEmail   || '';
  const storePhone   = settings.storePhone   || '';
  const gstNumber    = settings.gstNumber    || '';
  const storePAN     = settings.storePAN     || '';
  const taxRate      = parseFloat(settings.taxRate || '0');
  const invoiceTerms = settings.invoiceTerms || '';

  const invoiceNo   = `INV-${order.id.slice(-8).toUpperCase()}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const effectiveStatus = returnStatus ? `RETURN_${returnStatus}` : (order.status || 'PENDING');
  const statusStyle = STATUS_STYLE[effectiveStatus] || STATUS_STYLE.PENDING;

  const subTotal       = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount       = order.discountAmount || 0;
  const walletDiscount = (order as any).walletDiscount || 0;
  const taxableAmount  = Math.max(0, subTotal - discount - walletDiscount);
  const taxAmount      = (taxableAmount * taxRate) / 100;
  const cgst           = taxAmount / 2;
  const sgst           = taxAmount / 2;
  const grandTotal     = taxableAmount + taxAmount;

  const shippingAddr = [
    (order as any).shippingAddress,
    (order as any).city,
    (order as any).state,
    (order as any).pincode,
  ].filter(Boolean).join(', ');

  let y = 14;

  // ── Header bar ───────────────────────────────────────────────────────────────
  doc.setFillColor(...C.primaryDark);
  doc.rect(0, 0, PW, 30, 'F');

  doc.setTextColor(...C.white);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(storeName, ML, 10);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const infoLeft: string[] = [];
  if (storeAddress) infoLeft.push(storeAddress);
  if (storeEmail)   infoLeft.push(`Email: ${storeEmail}`);
  if (storePhone)   infoLeft.push(`Phone: ${storePhone}`);
  if (gstNumber)    infoLeft.push(`GSTIN: ${gstNumber}${storePAN ? '   PAN: ' + storePAN : ''}`);
  infoLeft.forEach((line, i) => doc.text(line, ML, 16 + i * 4.5));

  // Right side
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', PW - MR, 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceNo,         PW - MR, 16,   { align: 'right' });
  doc.text(`Date: ${invoiceDate}`, PW - MR, 21, { align: 'right' });

  y = 34;

  // ── Status row ────────────────────────────────────────────────────────────────
  let pillX = ML;
  pillX += pill(doc, statusStyle.label, pillX, y, statusStyle.bg, statusStyle.text);
  if (order.paymentStatus === 'PAID') {
    pill(doc, 'PAID', pillX, y, C.greenBg, C.green);
  }

  const trackingNumber = (order as any).trackingNumber;
  const awbCode = (order as any).awbCode;
  if (trackingNumber) {
    y += 7;
    doc.setFontSize(7.5);
    doc.setTextColor(...C.slate600);
    doc.text(`Tracking: ${trackingNumber}${awbCode ? '   AWB: ' + awbCode : ''}`, ML, y);
  }
  y += 10;

  // ── Bill To / Ship To ────────────────────────────────────────────────────────
  const halfW = (CW - 4) / 2;
  const boxY  = y;
  const boxH  = 26;

  // Bill To
  doc.setFillColor(...C.slate100);
  doc.roundedRect(ML, boxY, halfW, boxH, 2, 2, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.slate400);
  doc.text('BILL TO', ML + 3, boxY + 5);
  doc.setFontSize(9);
  doc.setTextColor(...C.primaryDark);
  doc.text(order.user?.name || 'Customer', ML + 3, boxY + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.slate600);
  const billInfo = [order.user?.email, (order as any).phone].filter(Boolean).join('   ');
  if (billInfo) doc.text(billInfo, ML + 3, boxY + 17);

  // Ship To
  const sx = ML + halfW + 4;
  doc.setFillColor(...C.slate100);
  doc.roundedRect(sx, boxY, halfW, boxH, 2, 2, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.slate400);
  doc.text('SHIP TO', sx + 3, boxY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.slate600);
  const addrLines = doc.splitTextToSize(shippingAddr || '-', halfW - 6);
  doc.text(addrLines, sx + 3, boxY + 11);

  y = boxY + boxH + 8;

  // ── Items table ───────────────────────────────────────────────────────────────
  // Columns (all in mm from left edge of page)
  // Item: 12–95  Qty:97  UnitPrice:115  TaxableAmt:134  GST%:147  GSTAmt:163  Total:198
  const COL = {
    item:     ML,
    qty:      97,
    unit:     116,
    taxable:  135,
    gstPct:   149,
    gstAmt:   166,
    total:    PW - MR,
  };
  const ROW_H = 8;
  const ITEM_MAX_W = COL.qty - COL.item - 3;

  // Header
  doc.setFillColor(...C.primaryDark);
  doc.rect(ML, y, CW, 8, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Item',          COL.item + 2,  y + 5.5);
  doc.text('Qty',           COL.qty,        y + 5.5, { align: 'center' });
  doc.text('Unit Price',    COL.unit,       y + 5.5, { align: 'right' });
  doc.text('Taxable Amt',   COL.taxable,    y + 5.5, { align: 'right' });
  doc.text('GST%',          COL.gstPct,     y + 5.5, { align: 'center' });
  doc.text('GST Amt',       COL.gstAmt,     y + 5.5, { align: 'right' });
  doc.text('Total',         COL.total,      y + 5.5, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.slate800);
  doc.setFontSize(8);

  order.items.forEach((item, idx) => {
    const lineTotal   = item.price * item.quantity;
    const lineTax     = taxRate > 0 ? (lineTotal / (1 + taxRate / 100)) * (taxRate / 100) : 0;
    const lineTaxable = lineTotal - lineTax;

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(ML, y, CW, ROW_H, 'F');
    }

    const name = item.product.name + (item.variantName ? ` (${item.variantName})` : '');
    const nameLine = doc.splitTextToSize(name, ITEM_MAX_W)[0];

    doc.setTextColor(...C.slate800);
    doc.text(nameLine,                  COL.item + 2,  y + 5.5);
    doc.text(String(item.quantity),     COL.qty,        y + 5.5, { align: 'center' });
    doc.text(rs(item.price),            COL.unit,       y + 5.5, { align: 'right' });
    doc.text(rs(lineTaxable),           COL.taxable,    y + 5.5, { align: 'right' });
    doc.text(`${taxRate}%`,             COL.gstPct,     y + 5.5, { align: 'center' });
    doc.text(rs(lineTax),               COL.gstAmt,     y + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(rs(lineTotal),             COL.total,      y + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    doc.setDrawColor(...C.slate100);
    doc.setLineWidth(0.2);
    doc.line(ML, y + ROW_H, ML + CW, y + ROW_H);
    y += ROW_H;
  });

  y += 5;

  // ── Totals block ──────────────────────────────────────────────────────────────
  const TLX = PW - MR - 75; // label start
  const TVX = PW - MR;       // value (right-aligned)

  const totalRow = (label: string, value: string, color?: [number,number,number], bold = false) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...(color || C.slate600));
    doc.text(label, TLX, y);
    doc.text(value, TVX, y, { align: 'right' });
    doc.setTextColor(...C.slate800);
    y += 6;
  };

  totalRow('Sub Total', rs(subTotal));
  if (discount > 0)
    totalRow(`Coupon${order.couponCode ? ' (' + order.couponCode + ')' : ''}`, rsMinus(discount), C.green);
  if (walletDiscount > 0)
    totalRow('Wallet / Points', rsMinus(walletDiscount), C.primary as [number,number,number]);
  if (taxRate > 0) {
    totalRow('Taxable Amount', rs(taxableAmount));
    totalRow(`CGST (${(taxRate / 2).toFixed(1)}%)`, rs(cgst));
    totalRow(`SGST (${(taxRate / 2).toFixed(1)}%)`, rs(sgst));
  }

  doc.setDrawColor(...C.primaryDark);
  doc.setLineWidth(0.4);
  doc.line(TLX, y, TVX, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.primaryDark);
  doc.text('Grand Total', TLX, y);
  doc.text(rs(grandTotal), TVX, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.slate800);
  y += 12;

  // ── Terms ─────────────────────────────────────────────────────────────────────
  if (invoiceTerms) {
    const termsLines = doc.splitTextToSize(invoiceTerms, CW - 8);
    const termsH = termsLines.length * 4.5 + 12;
    doc.setFillColor(...C.slate100);
    doc.roundedRect(ML, y, CW, termsH, 2, 2, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.slate400);
    doc.text('TERMS & CONDITIONS', ML + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.slate600);
    doc.text(termsLines, ML + 4, y + 11);
    y += termsH + 6;
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...C.slate100);
  doc.setLineWidth(0.3);
  doc.line(ML, pageH - 12, PW - MR, pageH - 12);
  doc.setFontSize(7);
  doc.setTextColor(...C.slate400);
  doc.text('This is a computer-generated invoice and does not require a physical signature.', ML, pageH - 7);
  doc.text(`Thank you for shopping with ${storeName}!`, PW - MR, pageH - 7, { align: 'right' });

  doc.save(`Invoice-${order.id.slice(-8).toUpperCase()}.pdf`);
}
