package com.cloudstorage.dto.response;

import com.cloudstorage.model.enums.ShareRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ShareDto {
    private UUID id;
    private SharedResource resource;
    private SharedUser sharedWith;
    private SharedUser sharedBy;
    private ShareRole role;
    private Instant createdAt;

    @Data
    @Builder
    public static class SharedUser {
        private UUID id;
        private String name;
        private String email;
        private String avatarUrl;
    }

    @Data
    @Builder
    public static class SharedResource {
        private UUID id;
        private String name;
        private String type; // "FILE" | "FOLDER"
    }
}
