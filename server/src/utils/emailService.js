import * as Brevo from '@getbrevo/brevo';

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

const SENDER = { name: 'RaiStore', email: process.env.BREVO_SENDER_EMAIL || 'raig64189@gmail.com' };

// ─── Helper ────────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, htmlContent }) {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender = SENDER;
  sendSmtpEmail.to = [{ email: to.email, name: to.name || to.email }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`📧 Email sent to ${to.email} — Subject: "${subject}"`);
  } catch (err) {
    console.error('❌ Brevo email error:', err?.message || err);
  }
}

// ─── 1. Welcome Email (after registration) ─────────────────────────────────

export async function sendWelcomeEmail(user) {
  await sendEmail({
    to: { email: user.email, name: user.full_name },
    subject: '🎉 Welcome to RaiStore!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ff6b00, #ff9d00); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; color: #fff; letter-spacing: 2px;">🛍️ RaiStore</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">Premium Lifestyle & Fashion</p>
        </div>
        <div style="padding: 36px 30px;">
          <h2 style="color: #ff8c00; margin-top: 0;">Welcome, ${user.full_name}! 👋</h2>
          <p style="color: #ccc; line-height: 1.7; font-size: 15px;">
            Your account has been successfully created. You're now part of the RaiStore family — where premium quality meets effortless style.
          </p>
          <div style="background: #1a1a1a; border-left: 4px solid #ff6b00; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #f5f5f5; font-size: 14px;">
              <strong>📧 Email:</strong> ${user.email}<br/>
              <strong>🗓️ Joined:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <p style="color: #ccc; font-size: 14px; line-height: 1.7;">Here's what you can do now:</p>
          <ul style="color: #ccc; font-size: 14px; line-height: 2;">
            <li>🛍️ Browse our exclusive product catalog</li>
            <li>❤️ Wishlist your favourite items</li>
            <li>🎟️ Use coupon codes for discounts</li>
            <li>📦 Track your orders in real-time</li>
          </ul>
          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:8080'}" 
               style="background: linear-gradient(135deg, #ff6b00, #ff9d00); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Start Shopping →
            </a>
          </div>
        </div>
        <div style="background: #1a1a1a; text-align: center; padding: 20px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} RaiStore. Built by Sudhanshu. All rights reserved.
        </div>
      </div>
    `,
  });
}

// ─── 2. Order Confirmation Email ────────────────────────────────────────────

export async function sendOrderConfirmationEmail(order) {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #2a2a2a; color: #f5f5f5; font-size: 14px;">
            ${item.product_name}${item.selected_size ? ` <span style="color:#888;">(${item.selected_size})</span>` : ''}
            ${item.selected_color ? ` <span style="color:#888;">${item.selected_color}</span>` : ''}
          </td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #2a2a2a; color: #ccc; text-align: center; font-size: 14px;">×${item.quantity}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #2a2a2a; color: #ff8c00; text-align: right; font-size: 14px; font-weight: bold;">
            ₹${(item.price * item.quantity).toLocaleString('en-IN')}
          </td>
        </tr>
      `
    )
    .join('');

  await sendEmail({
    to: { email: order.customer_email, name: order.customer_name },
    subject: `✅ Order Confirmed — ${order.order_number}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ff6b00, #ff9d00); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; color: #fff;">✅ Order Confirmed!</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">Order #${order.order_number}</p>
        </div>
        <div style="padding: 36px 30px;">
          <p style="color: #ccc; font-size: 15px; line-height: 1.7;">
            Hi <strong style="color: #fff;">${order.customer_name}</strong>, thank you for your purchase! 
            We've received your order and it's now being processed.
          </p>

          <h3 style="color: #ff8c00; border-bottom: 1px solid #2a2a2a; padding-bottom: 10px;">🛒 Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; color: #888; font-size: 12px; padding: 8px; border-bottom: 1px solid #333;">ITEM</th>
                <th style="text-align: center; color: #888; font-size: 12px; padding: 8px; border-bottom: 1px solid #333;">QTY</th>
                <th style="text-align: right; color: #888; font-size: 12px; padding: 8px; border-bottom: 1px solid #333;">PRICE</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin-top: 24px;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #888; font-size: 14px; padding: 4px 0;">Subtotal</td>
                <td style="color: #f5f5f5; text-align: right; font-size: 14px;">₹${order.subtotal?.toLocaleString('en-IN') || '—'}</td>
              </tr>
              ${order.discount > 0 ? `
              <tr>
                <td style="color: #888; font-size: 14px; padding: 4px 0;">Discount</td>
                <td style="color: #4ade80; text-align: right; font-size: 14px;">−₹${order.discount?.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr>
                <td style="color: #888; font-size: 14px; padding: 4px 0;">Shipping</td>
                <td style="color: #f5f5f5; text-align: right; font-size: 14px;">${order.shipping_cost === 0 ? '<span style="color:#4ade80;">FREE</span>' : `₹${order.shipping_cost?.toLocaleString('en-IN')}`}</td>
              </tr>
              <tr style="border-top: 1px solid #333;">
                <td style="color: #fff; font-size: 16px; font-weight: bold; padding-top: 12px;">Total</td>
                <td style="color: #ff8c00; text-align: right; font-size: 16px; font-weight: bold; padding-top: 12px;">₹${order.total?.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          ${order.shipping_address?.address ? `
          <h3 style="color: #ff8c00; margin-top: 28px;">📦 Delivery Address</h3>
          <p style="color: #ccc; font-size: 14px; line-height: 1.7; background: #1a1a1a; border-radius: 8px; padding: 16px;">
            ${order.shipping_address.address}<br/>
            ${order.shipping_address.city || ''}${order.shipping_address.state ? ', ' + order.shipping_address.state : ''}
            ${order.shipping_address.pincode ? ' — ' + order.shipping_address.pincode : ''}
          </p>` : ''}

          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:8080'}/orders"
               style="background: linear-gradient(135deg, #ff6b00, #ff9d00); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              View Order Status →
            </a>
          </div>
        </div>
        <div style="background: #1a1a1a; text-align: center; padding: 20px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} RaiStore. Built by Sudhanshu. All rights reserved.
        </div>
      </div>
    `,
  });
}

// ─── 3. Order Status Update Email ──────────────────────────────────────────

const STATUS_LABELS = {
  processing: { emoji: '⚙️', label: 'Being Processed', color: '#facc15', msg: 'Your order is currently being prepared and will be dispatched soon.' },
  shipped:    { emoji: '🚚', label: 'Shipped',          color: '#38bdf8', msg: 'Great news! Your order is on its way. Expect delivery within 3–5 business days.' },
  delivered:  { emoji: '✅', label: 'Delivered',        color: '#4ade80', msg: 'Your order has been delivered. We hope you love your purchase!' },
  cancelled:  { emoji: '❌', label: 'Cancelled',        color: '#f87171', msg: 'Your order has been cancelled. If you have any questions, please contact our support team.' },
  refunded:   { emoji: '💸', label: 'Refunded',         color: '#a78bfa', msg: 'Your refund has been initiated and should reflect within 5–7 business days.' },
};

export async function sendOrderStatusEmail(order) {
  const info = STATUS_LABELS[order.status];
  if (!info) return; // Don't send for 'pending' — that's handled by confirmation email

  await sendEmail({
    to: { email: order.customer_email, name: order.customer_name },
    subject: `${info.emoji} Order ${info.label} — ${order.order_number}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ff6b00, #ff9d00); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 40px;">${info.emoji}</h1>
          <h2 style="margin: 10px 0 0; color: #fff; font-size: 22px;">Order ${info.label}</h2>
          <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Order #${order.order_number}</p>
        </div>
        <div style="padding: 36px 30px;">
          <div style="background: #1a1a1a; border-left: 4px solid ${info.color}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0; color: #f5f5f5; font-size: 15px; line-height: 1.7;">
              Hi <strong>${order.customer_name}</strong>,<br/>${info.msg}
            </p>
          </div>
          <div style="background: #1a1a1a; border-radius: 8px; padding: 20px;">
            <p style="margin: 0; color: #888; font-size: 13px;">
              <strong style="color: #f5f5f5;">Order Number:</strong> ${order.order_number}<br/>
              <strong style="color: #f5f5f5;">Status:</strong> <span style="color: ${info.color}; font-weight: bold;">${info.label}</span><br/>
              <strong style="color: #f5f5f5;">Total Paid:</strong> <span style="color: #ff8c00; font-weight: bold;">₹${order.total?.toLocaleString('en-IN')}</span>
            </p>
          </div>
          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:8080'}/orders"
               style="background: linear-gradient(135deg, #ff6b00, #ff9d00); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Track Your Order →
            </a>
          </div>
        </div>
        <div style="background: #1a1a1a; text-align: center; padding: 20px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} RaiStore. Built by Sudhanshu. All rights reserved.
        </div>
      </div>
    `,
  });
}
