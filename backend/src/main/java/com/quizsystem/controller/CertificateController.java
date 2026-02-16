package com.quizsystem.controller;

import com.quizsystem.model.Certificate;
import com.quizsystem.model.User;
import com.quizsystem.repository.UserRepository;
import com.quizsystem.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final UserRepository userRepository;

    @PostMapping("/generate/{attemptId}")
    public ResponseEntity<?> generateCertificate(@PathVariable String attemptId, Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Certificate certificate = certificateService.getOrCreateCertificate(attemptId, user.getId());
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String id) {
        byte[] pdfBytes = certificateService.generateCertificatePdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDispositionFormData("attachment", "certificate.png");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping("/verify/{code}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String code) {
        try {
            Certificate certificate = certificateService.verifyCertificate(code);
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Certificate not found");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Certificate>> getMyCertificates(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(certificateService.getUserCertificates(user.getId()));
    }
}
