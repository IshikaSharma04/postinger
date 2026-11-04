function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export function verificationEmailTemplate({
  name,
  verifyUrl,
}: {
  name: string;
  verifyUrl: string;
}): EmailContent {
  const safeName = escapeHtml(name);
  return {
    subject: "Welcome to Postinger — Please verify your email",
    text: `Welcome to Postinger, ${name}! Click here to verify your email and begin onboarding: ${verifyUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111;">Verify your Postinger account</h2>
        <p>Hi ${safeName},</p>
        <p>Welcome aboard! You're one step away from scheduling content across all your social channels with Postinger.</p>
        <div style="margin: 32px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Verify Email &amp; Continue →
          </a>
        </div>
        <p style="color: #666; font-size: 13px;">Or copy and paste this link in your browser:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `.trim(),
  };
}

export function passwordResetEmailTemplate({
  resetUrl,
}: {
  resetUrl: string;
}): EmailContent {
  return {
    subject: "Reset your Postinger password",
    text: `Click here to reset your Postinger password: ${resetUrl}. This link expires in 1 hour.`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111;">Password Reset Request</h2>
        <p>We received a request to reset your password for your Postinger account.</p>
        <div style="margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset Password →
          </a>
        </div>
        <p style="color: #666; font-size: 13px;">This link will expire in 60 minutes. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `.trim(),
  };
}

export function workspaceInviteEmailTemplate({
  inviterName,
  workspaceName,
  inviteUrl,
}: {
  inviterName: string;
  workspaceName: string;
  inviteUrl: string;
}): EmailContent {
  const safeInviter = escapeHtml(inviterName);
  const safeWorkspace = escapeHtml(workspaceName);
  return {
    subject: `You've been invited to join ${workspaceName} on Postinger`,
    text: `${inviterName} invited you to collaborate in ${workspaceName} on Postinger: ${inviteUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111;">Join ${safeWorkspace} on Postinger</h2>
        <p>${safeInviter} has invited you to collaborate on social publishing in ${safeWorkspace}.</p>
        <div style="margin: 32px 0;">
          <a href="${inviteUrl}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Accept Invitation →
          </a>
        </div>
      </div>
    `.trim(),
  };
}
