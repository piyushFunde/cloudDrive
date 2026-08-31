package com.cloudstorage.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class FileDto {
    private UUID id;
    private String name;
    private String mimeType;
    private Long size;
    private String downloadUrl;
    private Boolean isStarred;
    private UUID folderId;
    private String folderName;
    private OwnerInfo owner;
    private Instant createdAt;
    private Instant deletedAt;

    @Data
    @Builder
    public static class OwnerInfo {
        private UUID id;
        private String name;
        private String email;
    }
}
