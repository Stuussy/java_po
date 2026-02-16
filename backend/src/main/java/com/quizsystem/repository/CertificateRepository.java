package com.quizsystem.repository;

import com.quizsystem.model.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends MongoRepository<Certificate, String> {

    Optional<Certificate> findByAttemptId(String attemptId);

    Optional<Certificate> findByVerificationCode(String verificationCode);

    List<Certificate> findByUserId(String userId);
}
