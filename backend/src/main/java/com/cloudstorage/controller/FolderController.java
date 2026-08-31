package com.cloudstorage.controller;

import com.cloudstorage.dto.request.CreateFolderRequest;
import com.cloudstorage.dto.request.MoveRequest;
import com.cloudstorage.dto.request.RenameRequest;
import com.cloudstorage.dto.response.ApiResponse;
import com.cloudstorage.dto.response.FolderContentsDto;
import com.cloudstorage.dto.response.FolderDto;
import com.cloudstorage.model.User;
import com.cloudstorage.security.CustomUserDetailsService;
import com.cloudstorage.service.FolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/folders")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Folders", description = "Folder creation and navigation")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping
    @Operation(summary = "Create a new folder")
    public ResponseEntity<ApiResponse<FolderDto>> createFolder(
            @Valid @RequestBody CreateFolderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FolderDto folder = folderService.createFolder(request, user);
        return ResponseEntity.ok(ApiResponse.success("Folder created", folder));
    }

    @GetMapping("/root")
    @Operation(summary = "Get root folder contents (My Drive)")
    public ResponseEntity<ApiResponse<FolderContentsDto>> getRootContents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FolderContentsDto contents = folderService.getRootContents(user);
        return ResponseEntity.ok(ApiResponse.success(contents));
    }

    @GetMapping("/{id}/contents")
    @Operation(summary = "Get folder contents (subfolders + files)")
    public ResponseEntity<ApiResponse<FolderContentsDto>> getFolderContents(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FolderContentsDto contents = folderService.getFolderContents(id, user);
        return ResponseEntity.ok(ApiResponse.success(contents));
    }

    @PatchMapping("/{id}/rename")
    @Operation(summary = "Rename a folder")
    public ResponseEntity<ApiResponse<FolderDto>> renameFolder(
            @PathVariable UUID id,
            @Valid @RequestBody RenameRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FolderDto folder = folderService.renameFolder(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Folder renamed", folder));
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Move a folder to another folder")
    public ResponseEntity<ApiResponse<FolderDto>> moveFolder(
            @PathVariable UUID id,
            @RequestBody MoveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FolderDto folder = folderService.moveFolder(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Folder moved", folder));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a folder (move to trash)")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        folderService.softDelete(id, user);
        return ResponseEntity.ok(ApiResponse.success("Folder moved to trash", null));
    }
}
