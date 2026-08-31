package com.cloudstorage.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class InitUploadRequest {

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "MIME type is required")
    private String mimeType;

    @NotNull(message = "File size is required")
    @Min(value = 1, message = "File size must be positive")
    private Long size;

    private UUID folderId;
}
