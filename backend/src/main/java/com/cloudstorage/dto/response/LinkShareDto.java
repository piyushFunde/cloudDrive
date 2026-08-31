package com.cloudstorage.dto.response;

import com.cloudstorage.model.enums.ShareRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class LinkShareDto {
    private UUID id;
    private String token;
    private String shareUrl;
    private ShareRole role;
    private boolean hasPassword;
    private Instant expiresAt;
    private Long accessCount;
    private SharedResource resource;
    private Instant createdAt;

    @Data
    @Builder
    public static class SharedResource {
        private UUID id;
        private String name;
        private String type; // "FILE" | "FOLDER"
    }
}
