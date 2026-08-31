package com.cloudstorage.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CompleteUploadRequest {

    @NotNull(message = "File ID is required")
    private UUID fileId;
}
