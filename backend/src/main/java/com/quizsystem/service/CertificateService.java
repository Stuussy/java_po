package com.quizsystem.service;

import com.quizsystem.model.Certificate;
import com.quizsystem.model.Test;
import com.quizsystem.model.TestAttempt;
import com.quizsystem.model.User;
import com.quizsystem.repository.CertificateRepository;
import com.quizsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final TestAttemptService attemptService;
    private final TestService testService;
    private final UserRepository userRepository;

    public Certificate getOrCreateCertificate(String attemptId, String userId) {
        Optional<Certificate> existing = certificateRepository.findByAttemptId(attemptId);
        if (existing.isPresent()) {
            return existing.get();
        }

        TestAttempt attempt = attemptService.getAttemptById(attemptId);
        Test test = testService.getTestById(attempt.getTestId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (attempt.getScore() == null || attempt.getScore() < test.getPassingScore()) {
            throw new RuntimeException("Test not passed. Certificate cannot be issued.");
        }

        String verificationCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Certificate certificate = Certificate.builder()
                .attemptId(attemptId)
                .userId(userId)
                .testId(test.getId())
                .studentName(user.getName())
                .testTitle(test.getTitle())
                .score(attempt.getScore())
                .verificationCode(verificationCode)
                .issuedAt(LocalDateTime.now())
                .build();

        return certificateRepository.save(certificate);
    }

    public Certificate verifyCertificate(String verificationCode) {
        return certificateRepository.findByVerificationCode(verificationCode)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
    }

    public List<Certificate> getUserCertificates(String userId) {
        return certificateRepository.findByUserId(userId);
    }

    public byte[] generateCertificatePdf(String certificateId) {
        Certificate cert = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        try {
            int width = 1200;
            int height = 850;
            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = image.createGraphics();

            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            // Background
            GradientPaint bgGradient = new GradientPaint(0, 0, new Color(240, 248, 255), width, height, new Color(230, 240, 250));
            g2d.setPaint(bgGradient);
            g2d.fillRect(0, 0, width, height);

            // Border
            g2d.setColor(new Color(44, 62, 80));
            g2d.setStroke(new BasicStroke(6));
            g2d.drawRect(20, 20, width - 40, height - 40);

            g2d.setColor(new Color(52, 152, 219));
            g2d.setStroke(new BasicStroke(2));
            g2d.drawRect(30, 30, width - 60, height - 60);

            // Decorative top bar
            GradientPaint topBar = new GradientPaint(0, 0, new Color(52, 152, 219), width, 0, new Color(155, 89, 182));
            g2d.setPaint(topBar);
            g2d.fillRect(30, 30, width - 60, 8);

            // Title
            g2d.setFont(new Font("Serif", Font.BOLD, 48));
            g2d.setColor(new Color(44, 62, 80));
            drawCenteredString(g2d, "CERTIFICATE", width, 120);

            g2d.setFont(new Font("Serif", Font.ITALIC, 22));
            g2d.setColor(new Color(127, 140, 141));
            drawCenteredString(g2d, "of Achievement", width, 160);

            // Decorative line
            g2d.setColor(new Color(52, 152, 219));
            g2d.setStroke(new BasicStroke(2));
            g2d.drawLine(350, 185, width - 350, 185);

            // "This certifies that"
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 18));
            g2d.setColor(new Color(100, 100, 100));
            drawCenteredString(g2d, "This certifies that", width, 230);

            // Student name
            g2d.setFont(new Font("Serif", Font.BOLD, 40));
            g2d.setColor(new Color(44, 62, 80));
            drawCenteredString(g2d, cert.getStudentName(), width, 290);

            // Decorative line under name
            g2d.setColor(new Color(52, 152, 219));
            g2d.setStroke(new BasicStroke(1));
            g2d.drawLine(300, 310, width - 300, 310);

            // "has successfully completed"
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 18));
            g2d.setColor(new Color(100, 100, 100));
            drawCenteredString(g2d, "has successfully completed the test", width, 360);

            // Test title
            g2d.setFont(new Font("Serif", Font.BOLD, 32));
            g2d.setColor(new Color(52, 152, 219));
            String testTitle = cert.getTestTitle();
            if (testTitle.length() > 50) {
                testTitle = testTitle.substring(0, 47) + "...";
            }
            drawCenteredString(g2d, "\"" + testTitle + "\"", width, 410);

            // Score
            g2d.setFont(new Font("SansSerif", Font.BOLD, 24));
            g2d.setColor(new Color(39, 174, 96));
            drawCenteredString(g2d, String.format("Score: %.1f%%", cert.getScore()), width, 470);

            // Date
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 16));
            g2d.setColor(new Color(100, 100, 100));
            String dateStr = cert.getIssuedAt().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
            drawCenteredString(g2d, "Date: " + dateStr, width, 520);

            // QR code area
            BufferedImage qrCode = generateQrCode(cert.getVerificationCode(), 120);
            int qrX = width - 190;
            int qrY = height - 220;
            g2d.drawImage(qrCode, qrX, qrY, null);

            g2d.setFont(new Font("SansSerif", Font.PLAIN, 10));
            g2d.setColor(new Color(100, 100, 100));
            String qrLabel = "Verification: " + cert.getVerificationCode();
            FontMetrics fm = g2d.getFontMetrics();
            int labelWidth = fm.stringWidth(qrLabel);
            g2d.drawString(qrLabel, qrX + (120 - labelWidth) / 2, qrY + 135);

            // Decorative bottom bar
            GradientPaint bottomBar = new GradientPaint(0, 0, new Color(155, 89, 182), width, 0, new Color(52, 152, 219));
            g2d.setPaint(bottomBar);
            g2d.fillRect(30, height - 38, width - 60, 8);

            // Signature area
            g2d.setColor(new Color(44, 62, 80));
            g2d.setStroke(new BasicStroke(1));
            g2d.drawLine(100, height - 120, 350, height - 120);
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 14));
            g2d.setColor(new Color(100, 100, 100));
            g2d.drawString("Online Quiz System", 140, height - 95);
            g2d.drawString("Administrator", 170, height - 75);

            // Certificate ID
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 10));
            g2d.setColor(new Color(180, 180, 180));
            drawCenteredString(g2d, "Certificate ID: " + cert.getId(), width, height - 50);

            g2d.dispose();

            // Convert to PNG bytes
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating certificate: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate certificate");
        }
    }

    private BufferedImage generateQrCode(String text, int size) {
        // Simple QR-like pattern generation (visual representation)
        BufferedImage qrImage = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = qrImage.createGraphics();

        // White background
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, size, size);

        // Generate deterministic pattern from verification code
        g.setColor(Color.BLACK);
        int moduleSize = size / 21;
        int hash = text.hashCode();

        // Finder patterns (3 corners)
        drawFinderPattern(g, 0, 0, moduleSize);
        drawFinderPattern(g, (21 - 7) * moduleSize, 0, moduleSize);
        drawFinderPattern(g, 0, (21 - 7) * moduleSize, moduleSize);

        // Data modules
        java.util.Random rng = new java.util.Random(hash);
        for (int row = 0; row < 21; row++) {
            for (int col = 0; col < 21; col++) {
                // Skip finder pattern areas
                if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) continue;
                if (rng.nextBoolean()) {
                    g.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
                }
            }
        }

        // Border
        g.setColor(Color.BLACK);
        g.drawRect(0, 0, size - 1, size - 1);

        g.dispose();
        return qrImage;
    }

    private void drawFinderPattern(Graphics2D g, int x, int y, int moduleSize) {
        g.setColor(Color.BLACK);
        g.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
        g.setColor(Color.WHITE);
        g.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
        g.setColor(Color.BLACK);
        g.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    }

    private void drawCenteredString(Graphics2D g, String text, int width, int y) {
        FontMetrics fm = g.getFontMetrics();
        int x = (width - fm.stringWidth(text)) / 2;
        g.drawString(text, x, y);
    }
}
