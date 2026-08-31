package com.cloudstorage.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RenameRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 500, message = "Name must be between 1 and 500 characters")
    private String name;
}
