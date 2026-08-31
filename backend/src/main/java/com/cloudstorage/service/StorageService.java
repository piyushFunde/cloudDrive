package com.cloudstorage.service;

/**
 * Storage abstraction layer.
 * Implementations: LocalStorageService (dev), AWSS3StorageService (prod).
 */
public interface StorageService {

    /**
     * Generate a presigned upload URL for the client to PUT a file directly.
     *
     * @param storageKey  the key/path to store the file at
     * @param mimeType    content-type of the file
     * @param fileSizeBytes expected file size in bytes
     * @return presigned upload URL string
     */
    String generatePresignedUploadUrl(String storageKey, String mimeType, long fileSizeBytes);

    /**
     * Generate a presigned download URL for the client to GET a file.
     *
     * @param storageKey  the key/path of the stored file
     * @param fileName    original file name (used in Content-Disposition)
     * @return presigned download URL string
     */
    String generatePresignedDownloadUrl(String storageKey, String fileName);

    /**
     * Delete an object from storage.
     *
     * @param storageKey the key/path of the file to delete
     */
    void deleteObject(String storageKey);

    /**
     * Get the storage provider name for client information.
     */
    String getProviderName();
}
