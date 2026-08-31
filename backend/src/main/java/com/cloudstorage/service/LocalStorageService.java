package com.cloudstorage.service;

import com.cloudstorage.exception.StorageException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Local filesystem storage implementation.
 * Used in development mode — files stored under './uploads', served via /api/files/local/** endpoint.
 * The "presigned upload URL" points to the backend's local upload endpoint.
 * The "presigned download URL" points to the backend's local serve endpoint.
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    @Value("${app.storage.local.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${app.storage.local.base-url:http://localhost:8080}")
    private String baseUrl;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created local upload directory: {}", uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            throw new StorageException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public String generatePresignedUploadUrl(String storageKey, String mimeType, long fileSizeBytes) {
        // In local mode, the upload URL points to our backend upload endpoint
        String encodedKey = URLEncoder.encode(storageKey, StandardCharsets.UTF_8);
        return baseUrl + "/api/files/local/upload?key=" + encodedKey;
    }

    @Override
    public String generatePresignedDownloadUrl(String storageKey, String fileName) {
        String encodedKey = URLEncoder.encode(storageKey, StandardCharsets.UTF_8);
        String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
        return baseUrl + "/api/files/local/download?key=" + encodedKey + "&name=" + encodedName;
    }

    @Override
    public void deleteObject(String storageKey) {
        try {
            Path filePath = Paths.get(uploadDir, storageKey);
            Files.deleteIfExists(filePath);
            log.info("Deleted local file: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete local file: {}", storageKey, e);
            throw new StorageException("Failed to delete file: " + storageKey, e);
        }
    }

    @Override
    public String getProviderName() {
        return "local";
    }

    public Path getFilePath(String storageKey) {
        return Paths.get(uploadDir).resolve(storageKey).normalize();
    }

    public String getUploadDir() {
        return uploadDir;
    }
}
