import nodemailer from "nodemailer";

export interface OrderNotificationItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderNotificationData {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDistrict: string;
  total: number;
  note?: string | null;
  items: OrderNotificationItem[];
}

/**
 * Sends a plain, clean HTML notification email to ORDER_NOTIFY_EMAIL
 * when a new order is placed. Errors are logged and do not throw.
 */
export async function sendOrderNotificationEmail(order: OrderNotificationData) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const notifyEmail = process.env.ORDER_NOTIFY_EMAIL;

  if (!host || !user || !pass || !notifyEmail) {
    console.warn(
      "⚠️ SMTP configuration incomplete (SMTP_HOST, SMTP_USER, SMTP_PASS, ORDER_NOTIFY_EMAIL). Email notification skipped."
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const adminOrderUrl = `/admin/orders/${order.id}`;

  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.unitPrice} BDT</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${item.unitPrice * item.quantity} BDT</td>
      </tr>`
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>New Order - ${order.invoiceNo}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #faf5e9; color: #2b2b2b; padding: 24px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #ede3ce; overflow: hidden;">
          <div style="background-color: #17281f; color: #faf5e9; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Shathi Foods</h1>
            <p style="margin: 4px 0 0; font-size: 14px; color: #c8962e;">New Order Notification</p>
          </div>
          
          <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <p style="margin: 0; font-size: 16px;"><strong>Invoice:</strong> ${order.invoiceNo}</p>
              <p style="margin: 0; font-size: 16px;"><strong>Total:</strong> <span style="color: #c1502e; font-weight: bold;">${order.total} BDT</span></p>
            </div>

            <h3 style="color: #17281f; border-bottom: 2px solid #ede3ce; padding-bottom: 6px; margin-top: 20px;">Customer Details</h3>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${order.customerName}</p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${order.customerPhone}" style="color: #c1502e; text-decoration: none;">${order.customerPhone}</a></p>
            <p style="margin: 4px 0;"><strong>Address:</strong> ${order.customerAddress}</p>
            <p style="margin: 4px 0;"><strong>District:</strong> ${order.customerDistrict}</p>
            ${
              order.note
                ? `<p style="margin: 8px 0; background: #faf5e9; padding: 8px; border-radius: 4px;"><strong>Note:</strong> ${order.note}</p>`
                : ""
            }

            <h3 style="color: #17281f; border-bottom: 2px solid #ede3ce; padding-bottom: 6px; margin-top: 24px;">Ordered Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 14px;">
              <thead>
                <tr style="background: #faf5e9;">
                  <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #ede3ce;">Product</th>
                  <th style="padding: 8px 12px; text-align: center; border-bottom: 2px solid #ede3ce;">Qty</th>
                  <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #ede3ce;">Price</th>
                  <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #ede3ce;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div style="margin-top: 32px; text-align: center;">
              <a href="${adminOrderUrl}" style="background-color: #17281f; color: #faf5e9; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Order in Admin Dashboard
              </a>
            </div>
          </div>
          
          <div style="background-color: #faf5e9; padding: 12px 24px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ede3ce;">
            Shathi Foods Pure Ghee E-Commerce Order Notification
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Shathi Foods Orders" <${user}>`,
      to: notifyEmail,
      subject: `New Order Received - ${order.invoiceNo}`,
      html: htmlContent,
    });
    console.log(`✓ Notification email sent successfully for order: ${order.invoiceNo}`);
  } catch (error) {
    console.error("❌ Failed to send order notification email:", error);
  }
}
