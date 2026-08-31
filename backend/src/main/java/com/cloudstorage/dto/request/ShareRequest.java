package com.cloudstorage.dto.request;

import com.cloudstorage.model.enums.ResourceType;
import com.cloudstorage.model.enums.ShareRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ShareRequest {

    @NotNull(message = "Resource ID is required")
    private UUID resourceId;

    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;

    @NotBlank(message = "Target email is required")
    @Email(message = "Invalid email format")
    private String targetEmail;

    @NotNull(message = "Share role is required")
    private ShareRole role;
}
