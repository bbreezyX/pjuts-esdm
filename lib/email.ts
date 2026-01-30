import { Resend } from "resend";
import { BATTERY_THRESHOLDS, getVoltageStatusLabel } from "./constants";

// Lazy-initialized Resend client (prevents build-time errors when API key is not set)
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Email sender - use your verified domain in production
const FROM_EMAIL =
  process.env.EMAIL_FROM || "PJUTS ESDM <onboarding@resend.dev>";

// App URL for links in emails
const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  process.env.AUTH_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

// Static assets URL for email images (must be publicly accessible)
// Use R2_PUBLIC_URL or assets domain - emails cannot load from localhost
const ASSETS_URL = (
  process.env.R2_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://assets.esdm.cloud"
).replace(/\/$/, "");

// ============================================
// TYPES
// ============================================

interface SendEmailResult {
  success: boolean;
  error?: string;
}

export interface EmailRecipient {
  email: string;
  name: string;
}

interface ReportNotificationData {
  unitSerial: string;
  unitProvince: string;
  unitRegency: string;
  reporterName: string;
  batteryVoltage: number;
  reportId?: string;
}

interface UnitNotificationData {
  unitSerial: string;
  unitProvince: string;
  unitRegency: string;
  createdByName: string;
}

// ============================================
// EMAIL COMPONENTS & STYLES
// ============================================

const styles = {
  body: "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #ffffff; color: #2d3748; margin: 0; padding: 0; line-height: 1.6;",
  container: "max-width: 600px; margin: 0 auto; padding: 20px;",
  logoContainer: "text-align: center; margin-bottom: 32px; padding-top: 20px;",
  logo: "height: 60px; width: auto;", // Adjust based on actual logo aspect ratio
  headerTitle:
    "color: #1a202c; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 24px; letter-spacing: -0.025em;",
  content: "font-size: 16px; color: #4a5568; margin-bottom: 32px;",
  text: "margin-bottom: 16px; line-height: 1.6;",
  greeting: "font-weight: 600; color: #1a202c; margin-bottom: 16px;",
  buttonContainer: "text-align: center; margin: 32px 0;",
  button:
    "background-color: #003366; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 4px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 51, 102, 0.2); transition: background-color 0.2s;",
  divider: "border-top: 1px solid #e2e8f0; margin: 40px 0 30px;",
  tableContainer:
    "background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 24px 0;",
  table: "width: 100%; border-collapse: separate; border-spacing: 0;",
  tdLabel:
    "padding: 8px 0; color: #718096; font-size: 14px; font-weight: 500; vertical-align: top; width: 35%;",
  tdValue:
    "padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600; vertical-align: top; text-align: right;",
  footer: "text-align: center;",
  footerLogo: "height: 30px; width: auto; opacity: 0.8; margin-bottom: 20px;",
  footerText:
    "color: #718096; font-size: 12px; margin-bottom: 12px; line-height: 1.5;",
  footerLinks: "color: #718096; font-size: 12px; margin-bottom: 20px;",
  footerLink: "color: #718096; text-decoration: underline; margin: 0 8px;",
  copyright: "color: #a0aec0; font-size: 12px;",
};

function BaseLayout(props: {
  title: string;
  children: string;
  previewText: string;
}) {
  // Use ASSETS_URL for email images - must be publicly accessible (not localhost)
  const logoUrl = `${ASSETS_URL}/logo-esdm.png`;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title}</title>
</head>
<body style="${styles.body}">
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${props.previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <div style="${styles.container}">
    <div style="${styles.logoContainer}">
      <img src="${logoUrl}" alt="PJUTS ESDM Logo" style="${styles.logo}">
    </div>

    <h1 style="${styles.headerTitle}">${props.title}</h1>
    
    <div style="${styles.content}">
      ${props.children}
    </div>
    
    <div style="${styles.divider}"></div>
    
    <div style="${styles.footer}">
      <img src="${logoUrl}" alt="PJUTS ESDM" style="${styles.footerLogo}">
      
      <p style="${styles.footerText}">
        Anda menerima email ini karena terdaftar di sistem Monitoring PJUTS ESDM.<br>
        Ini adalah notifikasi otomatis untuk memastikan keamanan dan kelancaran operasional unit.
      </p>
      
      <div style="${styles.footerLinks}">
        <a href="${APP_URL}" style="${styles.footerLink}">Dashboard</a> | 
        <a href="${APP_URL}/map" style="${
    styles.footerLink
  }">Peta Sebaran</a> | 
        <a href="mailto:support@esdm.go.id" style="${
          styles.footerLink
        }">Bantuan</a>
      </div>
      
      <p style="${styles.copyright}">
        &copy; ${new Date().getFullYear()} PJUTS ESDM. Hak cipta dilindungi undang-undang.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function DataRow(label: string, value: string | number) {
  return `
    <tr>
      <td style="${styles.tdLabel}">${label}</td>
      <td style="${styles.tdValue}">${value}</td>
    </tr>
  `;
}

function StatusBadge(text: string, color: string, bgColor: string) {
  return `
    <span style="display: inline-block; background-color: ${bgColor}; color: ${color}; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.025em; text-transform: uppercase;">
      ${text}
    </span>
  `;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

function getReportNotificationHtml(
  data: ReportNotificationData,
  recipientName: string = "Admin"
): string {
  // Use centralized constants for voltage thresholds
  const statusText = getVoltageStatusLabel(data.batteryVoltage);
  let statusColor = "#e53e3e"; // red (offline)
  let statusBg = "#fff5f5";

  if (data.batteryVoltage >= BATTERY_THRESHOLDS.OPERATIONAL_MIN) {
    statusColor = "#38a169"; // green
    statusBg = "#f0fff4";
  } else if (data.batteryVoltage >= BATTERY_THRESHOLDS.MAINTENANCE_MIN) {
    statusColor = "#d69e2e"; // yellow
    statusBg = "#fffff0";
  }

  const content = `
    <p style="${styles.greeting}">Halo, ${recipientName}</p>
    
    <p style="${styles.text}">
      Laporan baru telah diterima dari petugas lapangan, <strong>${
        data.reporterName
      }</strong>. 
      Mohon tinjau detail kondisi unit PJUTS berikut:
    </p>
    
    <div style="${styles.tableContainer}">
      <table style="${styles.table}">
        ${DataRow("ID Unit", data.unitSerial)}
        ${DataRow("Lokasi", `${data.unitRegency}, ${data.unitProvince}`)}
        <tr>
          <td style="${styles.tdLabel}">Status Baterai</td>
          <td style="${styles.tdValue}">
            ${StatusBadge(
              `${data.batteryVoltage}V • ${statusText}`,
              statusColor,
              statusBg
            )}
          </td>
        </tr>
      </table>
    </div>
    
    <p style="${styles.text}">
      Data ini membantu kami menjaga keandalan sistem PJUTS. Klik tombol di bawah untuk melihat laporan lengkap.
    </p>
    
    <div style="${styles.buttonContainer}">
      <a href="${APP_URL}/reports" style="${styles.button}">
        Lihat Detail Laporan
      </a>
    </div>
  `;

  return BaseLayout({
    title: "Laporan PJUTS Baru Masuk",
    previewText: `Laporan baru dari ${data.reporterName} untuk unit ${data.unitSerial}. Status: ${statusText}.`,
    children: content,
  });
}

function getUnitNotificationHtml(
  data: UnitNotificationData,
  recipientName: string = "Petugas Lapangan"
): string {
  const content = `
    <p style="${styles.greeting}">Halo, ${recipientName}</p>
    
    <p style="${styles.text}">
      Unit PJUTS baru dengan Serial Number <strong>${
        data.unitSerial
      }</strong> telah ditambahkan ke sistem. 
      Sebelum unit ini dapat beroperasi penuh, verifikasi lapangan diperlukan.
    </p>
    
    <div style="${styles.tableContainer}">
      <table style="${styles.table}">
        ${DataRow("Serial Number", data.unitSerial)}
        ${DataRow("Provinsi", data.unitProvince)}
        ${DataRow("Kab/Kota", data.unitRegency)}
        ${DataRow("Ditambahkan Oleh", data.createdByName)}
        <tr>
          <td style="${styles.tdLabel}">Status</td>
          <td style="${styles.tdValue}">
            ${StatusBadge("Menunggu Verifikasi", "#dd6b20", "#fffaf0")}
          </td>
        </tr>
      </table>
    </div>
    
    <p style="${styles.text}">
      Silakan kunjungi lokasi unit untuk melakukan inspeksi fisik dan verifikasi data melalui aplikasi.
    </p>
    
    <div style="${styles.buttonContainer}">
      <a href="${APP_URL}/map" style="${styles.button}">
        Verifikasi Unit Sekarang
      </a>
    </div>
  `;

  return BaseLayout({
    title: "Unit Baru Perlu Verifikasi",
    previewText: `Unit baru ${data.unitSerial} ditambahkan di ${data.unitRegency}. Segera lakukan verifikasi.`,
    children: content,
  });
}

// ============================================
// SEND FUNCTIONS
// ============================================

/**
 * Send notification to admins when a new report is submitted
 */
export async function sendReportNotificationToAdmins(
  recipients: EmailRecipient[],
  data: ReportNotificationData
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: true }; // Don't fail if email not configured
  }

  if (recipients.length === 0) {
    return { success: true };
  }

  try {
    // Generate unique timestamp for this batch to prevent Resend deduplication
    const timestamp = Date.now();
    
    // Send individual emails to personalize greeting
    const emailPromises = recipients.map(async (recipient, index) => {
      const { error } = await client.emails.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject: `[Laporan] ${data.unitSerial} - ${data.reporterName}`,
        html: getReportNotificationHtml(data, recipient.name),
        headers: {
          "X-Entity-Ref-ID": `report-${data.reportId || data.unitSerial}-${timestamp}-${index}`,
        },
      });
      return { success: !error, error: error?.message };
    });

    await Promise.all(emailPromises);

    return { success: true };
  } catch (error) {
    console.error("Error sending report notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send notification to field staff when a new unit is added
 */
export async function sendUnitNotificationToFieldStaff(
  recipients: EmailRecipient[],
  data: UnitNotificationData
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: true }; // Don't fail if email not configured
  }

  if (recipients.length === 0) {
    return { success: true };
  }

  try {
    // Generate unique timestamp for this batch to prevent Resend deduplication
    const timestamp = Date.now();
    
    // Send individual emails to personalize greeting
    const emailPromises = recipients.map(async (recipient, index) => {
      const { error } = await client.emails.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject: `[Unit Baru] ${data.unitSerial} - ${data.unitProvince}`,
        html: getUnitNotificationHtml(data, recipient.name),
        headers: {
          "X-Entity-Ref-ID": `unit-${data.unitSerial}-${timestamp}-${index}`,
        },
      });
      return { success: !error, error: error?.message };
    });

    await Promise.all(emailPromises);

    return { success: true };
  } catch (error) {
    console.error("Error sending unit notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// ACCOUNT STATUS NOTIFICATION EMAILS
// ============================================

interface AccountStatusData {
  userName: string;
  userEmail: string;
}

function getAccountDisabledHtml(data: AccountStatusData): string {
  const content = `
    <p style="${styles.greeting}">Halo, ${data.userName}</p>
    
    <p style="${styles.text}">
      Kami informasikan bahwa akun Anda dengan email <strong>${
        data.userEmail
      }</strong> 
      telah <strong>dinonaktifkan</strong> oleh administrator sistem PJUTS ESDM.
    </p>
    
    <div style="${styles.tableContainer}">
      <table style="${styles.table}">
        ${DataRow("Status Akun", "Dinonaktifkan")}
        ${DataRow("Email", data.userEmail)}
        ${DataRow(
          "Waktu",
          new Date().toLocaleString("id-ID", {
            dateStyle: "long",
            timeStyle: "short",
          })
        )}
      </table>
    </div>
    
    <p style="${styles.text}">
      Selama akun dinonaktifkan, Anda tidak akan dapat masuk ke sistem. 
      Jika Anda merasa ini adalah kesalahan atau memerlukan informasi lebih lanjut, 
      silakan hubungi administrator.
    </p>
    
    <div style="${styles.buttonContainer}">
      <a href="mailto:support@esdm.go.id" style="${styles.button}">
        Hubungi Administrator
      </a>
    </div>
  `;

  return BaseLayout({
    title: "Akun Anda Dinonaktifkan",
    previewText: `Akun ${data.userEmail} telah dinonaktifkan oleh administrator.`,
    children: content,
  });
}

function getAccountEnabledHtml(data: AccountStatusData): string {
  const content = `
    <p style="${styles.greeting}">Halo, ${data.userName}</p>
    
    <p style="${styles.text}">
      Kabar baik! Akun Anda dengan email <strong>${data.userEmail}</strong> 
      telah <strong>diaktifkan kembali</strong> oleh administrator sistem PJUTS ESDM.
    </p>
    
    <div style="${styles.tableContainer}">
      <table style="${styles.table}">
        ${DataRow("Status Akun", "Aktif")}
        ${DataRow("Email", data.userEmail)}
        ${DataRow(
          "Waktu",
          new Date().toLocaleString("id-ID", {
            dateStyle: "long",
            timeStyle: "short",
          })
        )}
      </table>
    </div>
    
    <p style="${styles.text}">
      Anda sekarang dapat masuk ke sistem dan menggunakan semua fitur yang tersedia. 
      Selamat bekerja kembali!
    </p>
    
    <div style="${styles.buttonContainer}">
      <a href="${APP_URL}/login" style="${styles.button}">
        Masuk ke Sistem
      </a>
    </div>
  `;

  return BaseLayout({
    title: "Akun Anda Diaktifkan Kembali",
    previewText: `Selamat datang kembali! Akun ${data.userEmail} telah diaktifkan.`,
    children: content,
  });
}

/**
 * Send notification when user account is disabled
 */
export async function sendAccountDisabledEmail(
  recipient: EmailRecipient
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: true };
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: "[PJUTS ESDM] Akun Anda Dinonaktifkan",
      html: getAccountDisabledHtml({
        userName: recipient.name,
        userEmail: recipient.email,
      }),
    });

    if (error) {
      console.error("Error sending account disabled email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending account disabled email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send notification when user account is re-enabled
 */
export async function sendAccountEnabledEmail(
  recipient: EmailRecipient
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: true };
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: recipient.email,
      subject: "[PJUTS ESDM] Akun Anda Diaktifkan Kembali",
      html: getAccountEnabledHtml({
        userName: recipient.name,
        userEmail: recipient.email,
      }),
    });

    if (error) {
      console.error("Error sending account enabled email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending account enabled email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// PASSWORD RESET EMAIL
// ============================================

interface PasswordResetData {
  userName: string;
  resetLink: string;
  expiresInMinutes: number;
}

function getPasswordResetHtml(data: PasswordResetData): string {
  const content = `
    <p style="${styles.greeting}">Halo, ${data.userName}</p>
    
    <p style="${styles.text}">
      Kami menerima permintaan untuk mereset password akun PJUTS ESDM Anda. 
      Klik tombol di bawah untuk membuat password baru.
    </p>
    
    <div style="${styles.buttonContainer}">
      <a href="${data.resetLink}" style="${styles.button}">
        Reset Password
      </a>
    </div>
    
    <div style="${styles.tableContainer}">
      <table style="${styles.table}">
        ${DataRow("Berlaku", `${data.expiresInMinutes} menit`)}
        ${DataRow("Penggunaan", "Link ini hanya dapat digunakan sekali")}
      </table>
    </div>
    
    <p style="${styles.text}">
      Jika Anda tidak meminta reset password, abaikan email ini. 
      Akun Anda tetap aman dan password tidak akan berubah.
    </p>
    
    <p style="${styles.text}; font-size: 12px; color: #718096;">
      Jika tombol tidak berfungsi, salin dan tempel link berikut ke browser Anda:<br>
      <span style="word-break: break-all; color: #4a5568;">${
        data.resetLink
      }</span>
    </p>
  `;

  return BaseLayout({
    title: "Reset Password",
    previewText: `Reset password akun PJUTS ESDM Anda. Link berlaku selama ${data.expiresInMinutes} menit.`,
    children: content,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: false, error: "Email service not configured" };
  }

  const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "[PJUTS ESDM] Reset Password",
      html: getPasswordResetHtml({
        userName,
        resetLink,
        expiresInMinutes: 60,
      }),
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
