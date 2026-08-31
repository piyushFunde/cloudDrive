package com.cloudstorage.dto.request;

import com.cloudstorage.model.enums.ResourceType;
import com.cloudstorage.model.enums.ShareRole;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CreateLinkShareRequest {

    @NotNull(message = "Resource ID is required")
    private UUID resourceId;

    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;

    @NotNull(message = "Share role is required")
    private ShareRole role;

    @Future(message = "Expiry must be in the future")
    private Instant expiresAt;

    private String password;
}
