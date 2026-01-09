import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

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
// EMAIL TEMPLATES
// ============================================

function getReportNotificationHtml(data: ReportNotificationData): string {
  const statusColor = data.batteryVoltage >= 20 
    ? "#10b981" // green
    : data.batteryVoltage >= 10 
      ? "#f59e0b" // amber
      : "#ef4444"; // red
  
  const statusText = data.batteryVoltage >= 20 
    ? "Operasional"
    : data.batteryVoltage >= 10 
      ? "Perlu Perawatan"
      : "Offline";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #003366; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">📋 Laporan PJUTS Baru</h1>
    </div>
    <div style="background-color: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #64748b; margin-top: 0;">Laporan baru telah dikirim oleh petugas lapangan:</p>
      
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 140px;">Unit</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.unitSerial}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Lokasi</td>
            <td style="padding: 8px 0; color: #1e293b;">${data.unitProvince}, ${data.unitRegency}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Pelapor</td>
            <td style="padding: 8px 0; color: #1e293b;">${data.reporterName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Tegangan Baterai</td>
            <td style="padding: 8px 0;">
              <span style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                ${data.batteryVoltage}V - ${statusText}
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="${APP_URL}/reports" style="display: inline-block; background-color: #003366; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">
          Lihat Laporan
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-bottom: 0;">
        Email ini dikirim otomatis oleh sistem PJUTS ESDM.<br>
        Jangan membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getUnitNotificationHtml(data: UnitNotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #003366; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">💡 Unit PJUTS Baru</h1>
    </div>
    <div style="background-color: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #64748b; margin-top: 0;">Unit PJUTS baru telah ditambahkan ke sistem:</p>
      
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 140px;">Serial Number</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.unitSerial}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Provinsi</td>
            <td style="padding: 8px 0; color: #1e293b;">${data.unitProvince}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Kabupaten/Kota</td>
            <td style="padding: 8px 0; color: #1e293b;">${data.unitRegency}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Ditambahkan oleh</td>
            <td style="padding: 8px 0; color: #1e293b;">${data.createdByName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Status</td>
            <td style="padding: 8px 0;">
              <span style="background-color: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                Belum Verifikasi
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      <p style="color: #64748b; font-size: 14px; background-color: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
        💡 <strong>Perhatian:</strong> Unit ini membutuhkan verifikasi lapangan. Silakan kunjungi lokasi dan buat laporan untuk memverifikasi unit.
      </p>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="${APP_URL}/map" style="display: inline-block; background-color: #003366; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600;">
          Lihat di Peta
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-bottom: 0;">
        Email ini dikirim otomatis oleh sistem PJUTS ESDM.<br>
        Jangan membalas email ini.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
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
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: true }; // Don't fail if email not configured
  }

  if (adminEmails.length === 0) {
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `Laporan Baru: ${data.unitSerial} - ${data.reporterName}`,
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
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return { success: true }; // Don't fail if email not configured
  }

  if (fieldStaffEmails.length === 0) {
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: fieldStaffEmails,
      subject: `Unit Baru Ditambahkan: ${data.unitSerial} - ${data.unitProvince}`,
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
