package com.cloudstorage.service;

import com.cloudstorage.exception.StorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * AWS S3 storage implementation using SDK v2 with presigned URLs.
 * Active when app.storage.provider=s3.
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "s3")
public class AWSS3StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(AWSS3StorageService.class);

    @Autowired
    private S3Client s3Client;

    @Autowired
    private S3Presigner s3Presigner;

    @Value("${app.storage.s3.bucket}")
    private String bucketName;

    @Value("${app.storage.s3.presigned-url-expiry:3600}")
    private long presignedUrlExpiry;

    @Override
    public String generatePresignedUploadUrl(String storageKey, String mimeType, long fileSizeBytes) {
        try {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .contentType(mimeType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(presignedUrlExpiry))
                    .putObjectRequest(objectRequest)
                    .build();

            return s3Presigner.presignPutObject(presignRequest).url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned upload URL for key: {}", storageKey, e);
            throw new StorageException("Failed to generate upload URL", e);
        }
    }

    @Override
    public String generatePresignedDownloadUrl(String storageKey, String fileName) {
        try {
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .responseContentDisposition("attachment; filename*=UTF-8''" + encodedFileName)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(presignedUrlExpiry))
                    .getObjectRequest(objectRequest)
                    .build();

            return s3Presigner.presignGetObject(presignRequest).url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned download URL for key: {}", storageKey, e);
            throw new StorageException("Failed to generate download URL", e);
        }
    }

    @Override
    public void deleteObject(String storageKey) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.info("Deleted S3 object: {}", storageKey);
        } catch (Exception e) {
            log.error("Failed to delete S3 object: {}", storageKey, e);
            throw new StorageException("Failed to delete file from storage", e);
        }
    }

    @Override
    public String getProviderName() {
        return "s3";
    }
}
