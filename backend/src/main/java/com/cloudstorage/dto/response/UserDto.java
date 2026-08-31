package com.cloudstorage.dto.response;

import com.cloudstorage.model.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserDto {
    private UUID id;
    private String email;
    private String name;
    private String avatarUrl;
    private UserRole role;
    private Long storageUsed;
    private Instant createdAt;
}
