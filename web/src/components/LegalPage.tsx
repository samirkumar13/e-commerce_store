import React from 'react';
import { useParams } from 'react-router-dom';

/* ── Default legal content ── */
const PRIVACY_DEFAULT = `At Qurion Tech, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.

1. INFORMATION WE COLLECT

Personal Information
When you place an order or register an account, we collect your name, email address, phone number, billing and shipping address, and payment information (processed securely — we do not store card details).

Usage Data
We automatically collect browser type, IP address, pages visited, time spent on pages, and referring URLs to improve our service.

Cookies
We use cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyse site traffic. You can disable cookies in your browser settings, though some features may not function correctly.

2. HOW WE USE YOUR INFORMATION

• To process and fulfil your orders
• To send order confirmations, shipping updates, and invoices
• To respond to your enquiries and provide customer support
• To send promotional emails (you may unsubscribe at any time)
• To improve our website, products, and services
• To detect and prevent fraud or unauthorised access

3. SHARING YOUR INFORMATION

We do not sell, trade, or rent your personal information to third parties. We may share your data with:
• Shipping partners (e.g. Shiprocket, courier services) to deliver your orders
• Payment processors to handle transactions securely
• Analytics providers (e.g. Google Analytics) in anonymised, aggregated form
• Law enforcement when required by applicable law

4. DATA SECURITY

We implement industry-standard security measures including SSL encryption, secure servers, and limited employee access to protect your personal data. However, no method of transmission over the internet is 100% secure.

5. YOUR RIGHTS

You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at support@quriontech.in.

6. THIRD-PARTY LINKS

Our website may contain links to external sites. We are not responsible for the privacy practices of those sites and encourage you to review their policies.

7. CHANGES TO THIS POLICY

We may update this Privacy Policy periodically. Changes will be posted on this page with a revised "Last updated" date. Continued use of our website constitutes acceptance of the updated policy.

8. CONTACT US

If you have any questions about this Privacy Policy, please contact us at:
Email: support@quriontech.in
Phone: +91 98765 43210`;

const TERMS_DEFAULT = `Welcome to Qurion Tech. By accessing or using our website and purchasing our products, you agree to be bound by these Terms of Service. Please read them carefully.

1. ACCEPTANCE OF TERMS

By using this website, you confirm that you are at least 18 years old or are accessing the site under the supervision of a parent or guardian, and that you agree to these Terms.

2. PRODUCTS & PRICING

All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices without prior notice.

3. ORDERS & PAYMENT

By placing an order, you offer to purchase the product at the listed price. We reserve the right to refuse or cancel any order due to product unavailability, pricing errors, or suspected fraud. Payment must be completed before dispatch. We accept UPI, credit/debit cards, and net banking via our payment gateway.

4. SHIPPING & DELIVERY

We aim to dispatch orders within 1–3 business days. Estimated delivery times are provided at checkout and are not guaranteed. Qurion Tech is not responsible for delays caused by couriers, customs, or events outside our control.

5. INTELLECTUAL PROPERTY

All content on this website — including text, images, logos, graphics, and software — is the property of Qurion Tech and protected by applicable intellectual property laws. You may not reproduce or distribute any content without our prior written permission.

6. PROHIBITED ACTIVITIES

You agree not to:
• Use the website for any unlawful purpose
• Attempt to gain unauthorised access to any part of the website
• Submit false or misleading information
• Engage in any activity that disrupts or interferes with the website's functionality

7. LIMITATION OF LIABILITY

To the maximum extent permitted by law, Qurion Tech shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products.

8. GOVERNING LAW

These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.

9. CHANGES TO TERMS

We may update these Terms at any time. Continued use of the website after changes constitutes acceptance of the revised Terms.

10. CONTACT US

For any questions regarding these Terms, please contact:
Email: support@quriontech.in
Phone: +91 98765 43210`;

const RETURN_DEFAULT = `At Qurion Tech, we want you to be completely satisfied with your purchase. If you are not happy with your order, we are here to help.

1. RETURN ELIGIBILITY

Items are eligible for return within 7 days of delivery, provided that:
• The item is unused and in its original condition
• All original packaging, accessories, and documentation are intact
• The item is not in the "non-returnable" category listed below

Non-Returnable Items:
• Items that have been used, damaged, or tampered with
• Software or downloadable products once activated
• Items marked as "Final Sale" or "Non-Returnable" on the product page
• Custom-ordered or made-to-order items

2. HOW TO INITIATE A RETURN

Step 1: Email us at support@quriontech.in with your order number, the item(s) you wish to return, and the reason for return.
Step 2: Our team will review your request within 1–2 business days and send return instructions.
Step 3: Pack the item securely in its original packaging and ship it to the address provided. We recommend using a trackable courier.

3. REFUND PROCESS

Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund.

Approved Refunds:
• Original payment method: 5–7 business days after approval
• Bank transfer: 3–5 business days after approval

Partial Refunds may be granted if the item shows signs of use, is missing accessories, or is returned after the 7-day window.

4. DAMAGED OR DEFECTIVE ITEMS

If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos and your order number. We will arrange a replacement or full refund at no additional cost to you.

5. EXCHANGE POLICY

We offer exchanges for the same product in a different variant (e.g. different specification or colour) subject to availability. Contact us at support@quriontech.in to request an exchange.

6. SHIPPING COSTS FOR RETURNS

• If the return is due to a defect or our error: we will bear the return shipping cost.
• If the return is for any other reason: the customer is responsible for return shipping charges.

7. CANCELLATIONS

Orders can be cancelled before dispatch by contacting us immediately. Once dispatched, the standard return process applies.

8. CONTACT US

For any return or refund queries:
Email: support@quriontech.in
Phone: +91 98765 43210
Working Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST`;

/* ── Page config ── */
const PAGE_CONFIG: Record<string, { title: string; settingKey: string; updatedKey: string; defaultContent: string }> = {
  privacy: {
    title: 'Privacy Policy',
    settingKey: 'privacyPolicy',
    updatedKey: 'privacyPolicyUpdatedAt',
    defaultContent: PRIVACY_DEFAULT,
  },
  terms: {
    title: 'Terms of Service',
    settingKey: 'termsOfService',
    updatedKey: 'termsOfServiceUpdatedAt',
    defaultContent: TERMS_DEFAULT,
  },
  returns: {
    title: 'Return & Refund Policy',
    settingKey: 'returnPolicy',
    updatedKey: 'returnPolicyUpdatedAt',
    defaultContent: RETURN_DEFAULT,
  },
};

/* ── Renderer: turns plain text into styled sections ── */
function renderContent(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  let pendingParagraph: string[] = [];

  const flushParagraph = () => {
    if (pendingParagraph.length > 0) {
      const content = pendingParagraph.join(' ').trim();
      if (content) {
        elements.push(
          <p key={key++} className="text-slate-600 text-sm leading-relaxed mb-4">{content}</p>
        );
      }
      pendingParagraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Numbered section heading: "1. SOMETHING IN CAPS" or "1. Something"
    const sectionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (sectionMatch) {
      flushParagraph();
      elements.push(
        <h2 key={key++} className="text-base font-bold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-100">
          {line}
        </h2>
      );
      continue;
    }

    // Bullet point
    if (line.startsWith('• ') || line.startsWith('- ')) {
      flushParagraph();
      elements.push(
        <li key={key++} className="text-slate-600 text-sm leading-relaxed ml-4 mb-1.5 list-disc">{line.slice(2)}</li>
      );
      continue;
    }

    // Step lines: "Step 1:", "Step 2:"
    if (/^Step \d+:/.test(line)) {
      flushParagraph();
      elements.push(
        <p key={key++} className="text-slate-700 text-sm font-medium leading-relaxed mb-2 ml-2">{line}</p>
      );
      continue;
    }

    // Sub-heading (ends with colon, short, no period): e.g. "Non-Returnable Items:"
    if (/^[A-Z][^.]{2,50}:$/.test(line)) {
      flushParagraph();
      elements.push(
        <p key={key++} className="text-slate-700 text-sm font-semibold mt-4 mb-1">{line}</p>
      );
      continue;
    }

    // Blank line → flush paragraph
    if (line === '') {
      flushParagraph();
      continue;
    }

    // Regular text — accumulate into paragraph
    pendingParagraph.push(line);
  }

  flushParagraph();
  return elements;
}

interface LegalPageProps {
  settings: Record<string, string>;
}

const LegalPage: React.FC<LegalPageProps> = ({ settings }) => {
  const { slug } = useParams<{ slug: string }>();
  const config = slug ? PAGE_CONFIG[slug] : undefined;

  if (!config) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h1>
        <p className="text-slate-500">This legal page does not exist.</p>
      </div>
    );
  }

  const rawContent = settings[config.settingKey] || config.defaultContent;
  const updatedAt = settings[config.updatedKey];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
              {updatedAt && (
                <p className="text-xs text-slate-400 mt-0.5">Last updated: {updatedAt}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Please read this {config.title.toLowerCase()} carefully before using our website or making a purchase from Qurion Tech.
          </p>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <ul className="m-0 p-0 list-none">
            {renderContent(rawContent)}
          </ul>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          If you have any questions, contact us at{' '}
          <a href="mailto:support@quriontech.in" className="text-cyan-600 hover:underline">
            support@quriontech.in
          </a>
        </p>
      </div>
    </div>
  );
};

export default LegalPage;
