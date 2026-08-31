package com.cloudstorage.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UploadInitResponse {
    private UUID fileId;
    private String uploadUrl;
    private String storageKey;
    private String storageProvider; // "local" | "s3"
}
