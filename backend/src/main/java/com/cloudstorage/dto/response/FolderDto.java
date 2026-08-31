package com.cloudstorage.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class FolderDto {
    private UUID id;
    private String name;
    private UUID parentFolderId;
    private String parentFolderName;
    private Long fileCount;
    private Long subFolderCount;
    private List<BreadcrumbItem> breadcrumb;
    private Instant createdAt;

    @Data
    @Builder
    public static class BreadcrumbItem {
        private UUID id;
        private String name;
    }
}
