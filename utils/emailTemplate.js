// Builds the HTML for the alert summary email.
// Receives a list of alert items: [{ message, riskStatus }, ...]
// Returns one big HTML string, ready for sendEmail.

// Colors for each severity, used for the left border of each row
const SEVERITY_COLORS = {
  expired: '#dc2626', 
  critical: '#ea580c',
  warning: '#d97706',
};

export const alertSummaryTemplate = (alertItems) => {
  // Build the alert rows first, one colored card per alert
  let rows = '';

  for (const item of alertItems) {
    const color = SEVERITY_COLORS[item.riskStatus];

    rows =
      rows +
      `
      <div style="background-color: #f9fafb; border-left: 4px solid ${color};
                  border-radius: 6px; padding: 12px 16px; margin-bottom: 10px;">
        <span style="display: inline-block; background-color: ${color}; color: #ffffff;
                     font-size: 11px; font-weight: bold; text-transform: uppercase;
                     letter-spacing: 0.5px; padding: 2px 8px; border-radius: 10px;
                     margin-bottom: 6px;">
          ${item.riskStatus}
        </span>
        <p style="margin: 6px 0 0 0; color: #374151; font-size: 14px; line-height: 1.5;">
          ${item.message}
        </p>
      </div>
    `;
  }

  // The full email shell around the rows
  return `
  <div style="background-color: #f3f4f6; padding: 24px 12px; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;
                border-radius: 12px; overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background-color: #111827; padding: 24px 32px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px;">
          Expiry Alert System
        </h1>
        <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 13px;">
          Intelligent Product Expiry Prediction
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 28px 32px;">
        <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">
          ${new Date().toDateString()}
        </p>
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 17px;">
          ${alertItems.length} product(s) need your attention
        </h2>

        ${rows}

        <!-- Button -->
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.DASHBOARD_URL}"
             style="display: inline-block; background-color: #111827; color: #ffffff;
                    text-decoration: none; font-size: 14px; font-weight: bold;
                    padding: 12px 28px; border-radius: 8px;">
            Open Dashboard
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb;
                  padding: 16px 32px; text-align: center;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
          You received this email because you are an administrator on the
          Expiry Alert System.<br>
          This is an automated notification. Please do not reply.
        </p>
      </div>

    </div>
  </div>
  `;
};
