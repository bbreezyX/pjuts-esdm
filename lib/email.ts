import { Resend } from "resend";

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
const FROM_EMAIL = process.env.EMAIL_FROM || "PJUTS ESDM <onboarding@resend.dev>";

// App URL for links in emails
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";

// ============================================
// TYPES
// ============================================

interface SendEmailResult {
  success: boolean;
  error?: string;
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
  body: "font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f1f5f9; color: #334155; -webkit-font-smoothing: antialiased;",
  container: "max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);",
  header: "background-color: #0f172a; padding: 32px 24px; text-align: center; background-image: linear-gradient(to bottom right, #0f172a, #1e293b);",
  headerTitle: "color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;",
  headerSubtitle: "color: #94a3b8; margin: 8px 0 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;",
  content: "padding: 40px 32px;",
  sectionTitle: "color: #0f172a; margin: 0 0 24px; font-size: 18px; font-weight: 600;",
  text: "color: #475569; margin-bottom: 24px; line-height: 1.6; font-size: 15px;",
  tableContainer: "background-color: #f8fafc; border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 32px;",
  table: "width: 100%; border-collapse: separate; border-spacing: 0;",
  tdLabel: "padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 500; vertical-align: top; width: 40%;",
  tdValue: "padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; vertical-align: top; text-align: right;",
  buttonContainer: "text-align: center; margin-top: 8px; margin-bottom: 8px;",
  button: "display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: all 0.2s;",
  divider: "border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;",
  footer: "background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;",
  footerText: "color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;"
};

function BaseLayout(props: { title: string; subtitle?: string; children: string; previewText: string }) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="${styles.body}">
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${props.previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <div style="padding: 40px 20px;">
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerTitle}">${props.title}</h1>
        ${props.subtitle ? `<p style="${styles.headerSubtitle}">${props.subtitle}</p>` : ''}
      </div>
      
      <div style="${styles.content}">
        ${props.children}
        
        <div style="${styles.divider}"></div>
        
        <p style="${styles.footerText}">
          Email ini dikirim otomatis oleh sistem PJUTS ESDM.<br>
          Mohon tidak membalas email ini secara langsung.
        </p>
      </div>
      
      <div style="${styles.footer}">
        <p style="${styles.footerText}">
          &copy; ${new Date().getFullYear()} PJUTS ESDM. Hak cipta dilindungi undang-undang.
        </p>
      </div>
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

function getReportNotificationHtml(data: ReportNotificationData): string {
  let statusText = "Offline";
  let statusColor = "#ef4444"; // red-500
  let statusBg = "#fef2f2"; // red-50
  
  if (data.batteryVoltage >= 20) {
    statusText = "Operasional";
    statusColor = "#10b981"; // emerald-500
    statusBg = "#ecfdf5"; // emerald-50
  } else if (data.batteryVoltage >= 10) {
    statusText = "Perlu Perawatan";
    statusColor = "#f59e0b"; // amber-500
    statusBg = "#fffbeb"; // amber-50
  }

  const content = `
    <p style="${styles.text}">
      Laporan baru telah diterima dari petugas lapangan. Berikut adalah detail kondisi unit PJUTS yang dilaporkan:
    </p>
    
    <div style="${styles.tableContainer}">
      <table style="${styles.table}">
        ${DataRow("Unit ID", data.unitSerial)}
        ${DataRow("Lokasi", `${data.unitRegency}, ${data.unitProvince}`)}
        ${DataRow("Pelapor", data.reporterName)}
        <tr>
          <td style="${styles.tdLabel}">Status Baterai</td>
          <td style="${styles.tdValue}">
            ${StatusBadge(`${data.batteryVoltage}V • ${statusText}`, statusColor, statusBg)}
          </td>
        </tr>
      </table>
    </div>
    
    <div style="${styles.buttonContainer}">
      <a href="${APP_URL}/reports" style="${styles.button}">
        Lihat Detail Laporan
      </a>
    </div>
  `;

  return BaseLayout({
    title: "Laporan PJUTS Baru",
    subtitle: `Unit ${data.unitSerial}`,
    previewText: `Laporan baru dari ${data.reporterName} untuk unit ${data.unitSerial} - Status: ${statusText}`,
    children: content
  });
}

function getUnitNotificationHtml(data: UnitNotificationData): string {
  const content = `
    <p style="${styles.text}">
      Unit PJUTS baru telah ditambahkan ke dalam sistem database. Unit ini memerlukan verifikasi lapangan untuk memastikan data yang dimasukkan sesuai.
    </p>
    
    <div style="${styles.tableContainer}">
      <table style="${styles.table}">
        ${DataRow("Serial Number", data.unitSerial)}
        ${DataRow("Provinsi", data.unitProvince)}
        ${DataRow("Kabupaten/Kota", data.unitRegency)}
        ${DataRow("Ditambahkan Oleh", data.createdByName)}
        <tr>
          <td style="${styles.tdLabel}">Status</td>
          <td style="${styles.tdValue}">
            ${StatusBadge("Menunggu Verifikasi", "#d97706", "#fffbeb")}
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px; margin-bottom: 32px; border-radius: 4px;">
      <p style="margin: 0; color: #9a3412; font-size: 14px; line-height: 1.5;">
        <strong>Tindakan Diperlukan:</strong><br>
        Silakan kunjungi lokasi unit untuk melakukan inspeksi fisik dan verifikasi data melalui aplikasi.
      </p>
    </div>
    
    <div style="${styles.buttonContainer}">
      <a href="${APP_URL}/map" style="${styles.button}">
        Lihat Lokasi di Peta
      </a>
    </div>
  `;

  return BaseLayout({
    title: "Unit Baru Ditambahkan",
    subtitle: "Menunggu Verifikasi",
    previewText: `Unit baru ${data.unitSerial} ditambahkan di ${data.unitRegency}, ${data.unitProvince}.`,
    children: content
  });
}

// ============================================
// SEND FUNCTIONS
// ============================================

/**
 * Send notification to admins when a new report is submitted
 */
export async function sendReportNotificationToAdmins(
  adminEmails: string[],
  data: ReportNotificationData
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: true }; // Don't fail if email not configured
  }

  if (adminEmails.length === 0) {
    return { success: true };
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `[Laporan] ${data.unitSerial} - ${data.reporterName}`,
      html: getReportNotificationHtml(data),
    });

    if (error) {
      console.error("Failed to send report notification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending report notification email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Send notification to field staff when a new unit is added
 */
export async function sendUnitNotificationToFieldStaff(
  fieldStaffEmails: string[],
  data: UnitNotificationData
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: true }; // Don't fail if email not configured
  }

  if (fieldStaffEmails.length === 0) {
    return { success: true };
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: fieldStaffEmails,
      subject: `[Unit Baru] ${data.unitSerial} - ${data.unitProvince}`,
      html: getUnitNotificationHtml(data),
    });

    if (error) {
      console.error("Failed to send unit notification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending unit notification email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
