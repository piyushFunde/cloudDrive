package com.cloudstorage.controller;

import com.cloudstorage.dto.response.ApiResponse;
import com.cloudstorage.dto.response.FileDto;
import com.cloudstorage.dto.response.FolderDto;
import com.cloudstorage.model.User;
import com.cloudstorage.security.CustomUserDetailsService;
import com.cloudstorage.service.TrashService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trash")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Trash", description = "Trash management — restore and permanent delete")
public class TrashController {

    @Autowired
    private TrashService trashService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @GetMapping
    @Operation(summary = "List all trashed items")
    public ResponseEntity<ApiResponse<TrashService.TrashContents>> listTrash(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(trashService.listTrash(user)));
    }

    @PostMapping("/files/{id}/restore")
    @Operation(summary = "Restore a file from trash")
    public ResponseEntity<ApiResponse<FileDto>> restoreFile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FileDto file = trashService.restoreFile(id, user);
        return ResponseEntity.ok(ApiResponse.success("File restored", file));
    }

    @PostMapping("/folders/{id}/restore")
    @Operation(summary = "Restore a folder from trash")
    public ResponseEntity<ApiResponse<FolderDto>> restoreFolder(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        FolderDto folder = trashService.restoreFolder(id, user);
        return ResponseEntity.ok(ApiResponse.success("Folder restored", folder));
    }

    @DeleteMapping("/files/{id}")
    @Operation(summary = "Permanently delete a file")
    public ResponseEntity<ApiResponse<Void>> permanentDeleteFile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        trashService.permanentDeleteFile(id, user);
        return ResponseEntity.ok(ApiResponse.success("File permanently deleted", null));
    }

    @DeleteMapping("/folders/{id}")
    @Operation(summary = "Permanently delete a folder")
    public ResponseEntity<ApiResponse<Void>> permanentDeleteFolder(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        trashService.permanentDeleteFolder(id, user);
        return ResponseEntity.ok(ApiResponse.success("Folder permanently deleted", null));
    }

    @DeleteMapping("/empty")
    @Operation(summary = "Empty the trash (permanently delete all)")
    public ResponseEntity<ApiResponse<Void>> emptyTrash(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        trashService.emptyTrash(user);
        return ResponseEntity.ok(ApiResponse.success("Trash emptied", null));
    }
}
