package com.cloudstorage.controller;

import com.cloudstorage.dto.request.CompleteUploadRequest;
import com.cloudstorage.dto.request.InitUploadRequest;
import com.cloudstorage.dto.request.MoveRequest;
import com.cloudstorage.dto.request.RenameRequest;
import com.cloudstorage.dto.response.ApiResponse;
import com.cloudstorage.dto.response.FileDto;
import com.cloudstorage.dto.response.UploadInitResponse;
import com.cloudstorage.exception.StorageException;
import com.cloudstorage.model.User;
import com.cloudstorage.security.CustomUserDetailsService;
import com.cloudstorage.service.FileService;
import com.cloudstorage.service.LocalStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Files", description = "File upload, download, and management")
public class FileController {

    @Autowired
    private FileService fileService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired(required = false)
    private LocalStorageService localStorageService;

    @PostMapping("/init-upload")
    @Operation(summary = "Initialize a file upload (returns presigned URL)")
    public ResponseEntity<ApiResponse<UploadInitResponse>> initUpload(
            @Valid @RequestBody InitUploadRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        UploadInitResponse response = fileService.initUpload(request, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/complete-upload")
    @Operation(summary = "Complete a file upload after S3/local PUT")
    public ResponseEntity<ApiResponse<FileDto>> completeUpload(
            @Valid @RequestBody CompleteUploadRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FileDto file = fileService.completeUpload(request, user);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", file));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get file metadata and download URL")
    public ResponseEntity<ApiResponse<FileDto>> getFile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FileDto file = fileService.getFile(id, user);
        return ResponseEntity.ok(ApiResponse.success(file));
    }

    @PatchMapping("/{id}/rename")
    @Operation(summary = "Rename a file")
    public ResponseEntity<ApiResponse<FileDto>> renameFile(
            @PathVariable UUID id,
            @Valid @RequestBody RenameRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FileDto file = fileService.renameFile(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("File renamed", file));
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Move a file to a different folder")
    public ResponseEntity<ApiResponse<FileDto>> moveFile(
            @PathVariable UUID id,
            @RequestBody MoveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FileDto file = fileService.moveFile(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("File moved", file));
    }

    @PatchMapping("/{id}/star")
    @Operation(summary = "Toggle star on a file")
    public ResponseEntity<ApiResponse<FileDto>> toggleStar(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FileDto file = fileService.toggleStar(id, user);
        return ResponseEntity.ok(ApiResponse.success(file));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a file (move to trash)")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        fileService.softDelete(id, user);
        return ResponseEntity.ok(ApiResponse.success("File moved to trash", null));
    }

    @GetMapping("/starred")
    @Operation(summary = "Get all starred files")
    public ResponseEntity<ApiResponse<List<FileDto>>> getStarred(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(fileService.getStarredFiles(user)));
    }

    // ===== Local Storage Endpoints (dev mode only) =====

    @PostMapping("/local/upload")
    @Operation(summary = "[DEV] Upload file to local storage")
    public ResponseEntity<ApiResponse<Void>> localUpload(
            @RequestParam("key") String storageKey,
            @RequestParam("file") MultipartFile file) {
        if (localStorageService == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Local storage is not enabled"));
        }
        try {
            Path filePath = localStorageService.getFilePath(storageKey);
            Files.createDirectories(filePath.getParent());
            file.transferTo(filePath);
            return ResponseEntity.ok(ApiResponse.success("File uploaded to local storage", null));
        } catch (IOException e) {
            throw new StorageException("Failed to save file locally", e);
        }
    }

    @GetMapping("/local/download")
    @Operation(summary = "[DEV] Download file from local storage")
    public ResponseEntity<Resource> localDownload(
            @RequestParam("key") String storageKey,
            @RequestParam("name") String fileName) {
        if (localStorageService == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Path filePath = localStorageService.getFilePath(storageKey);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
