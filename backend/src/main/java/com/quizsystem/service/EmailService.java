package com.quizsystem.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;

        String subject = "Password Reset - Online Quiz System";

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f0f4f8;">
                    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
                        <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                            <div style="background:linear-gradient(135deg,#667eea 0%%,#14b8a6 100%%);padding:40px 30px;text-align:center;">
                                <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">Online Quiz System</h1>
                                <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Password Reset Request</p>
                            </div>
                            <div style="padding:40px 30px;">
                                <p style="color:#334155;font-size:16px;margin:0 0 16px;">Hello, <strong>%s</strong>!</p>
                                <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
                                    We received a request to reset your password. Click the button below to create a new password.
                                    This link is valid for <strong>1 hour</strong>.
                                </p>
                                <div style="text-align:center;margin:32px 0;">
                                    <a href="%s"
                                       style="display:inline-block;background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);color:white;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:16px;font-weight:600;">
                                        Reset Password
                                    </a>
                                </div>
                                <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0 0 16px;">
                                    If the button doesn't work, copy and paste this link into your browser:
                                </p>
                                <p style="background:#f1f5f9;padding:12px;border-radius:8px;word-break:break-all;color:#475569;font-size:13px;margin:0 0 24px;">
                                    %s
                                </p>
                                <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:20px;">
                                    <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0;">
                                        If you did not request a password reset, you can safely ignore this email.
                                        Your password will remain unchanged.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px;">
                            &copy; 2025 Online Quiz System. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(userName, resetUrl, resetUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}
