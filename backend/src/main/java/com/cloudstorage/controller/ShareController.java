package com.cloudstorage.controller;

import com.cloudstorage.dto.request.CreateLinkShareRequest;
import com.cloudstorage.dto.request.ShareRequest;
import com.cloudstorage.dto.response.ApiResponse;
import com.cloudstorage.dto.response.LinkShareDto;
import com.cloudstorage.dto.response.ShareDto;
import com.cloudstorage.model.User;
import com.cloudstorage.security.CustomUserDetailsService;
import com.cloudstorage.service.ShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Sharing", description = "File and folder sharing")
public class ShareController {

    @Autowired
    private ShareService shareService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/api/shares")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Share a file or folder with a user")
    public ResponseEntity<ApiResponse<ShareDto>> shareWithUser(
            @Valid @RequestBody ShareRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        ShareDto share = shareService.shareWithUser(request, user);
        return ResponseEntity.ok(ApiResponse.success("Shared successfully", share));
    }

    @GetMapping("/api/shares")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all items shared with me")
    public ResponseEntity<ApiResponse<List<ShareDto>>> getMyShares(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(shareService.getSharesForUser(user)));
    }

    @DeleteMapping("/api/shares/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Revoke a share")
    public ResponseEntity<ApiResponse<Void>> revokeShare(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        shareService.revokeShare(id, user);
        return ResponseEntity.ok(ApiResponse.success("Share revoked", null));
    }

    @PostMapping("/api/public-links")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a public share link")
    public ResponseEntity<ApiResponse<LinkShareDto>> createPublicLink(
            @Valid @RequestBody CreateLinkShareRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        LinkShareDto link = shareService.createPublicLink(request, user);
        return ResponseEntity.ok(ApiResponse.success("Link created", link));
    }

    @GetMapping("/api/public-links/{token}")
    @Operation(summary = "Access a public share link (no auth required)")
    public ResponseEntity<ApiResponse<LinkShareDto>> accessPublicLink(
            @PathVariable String token,
            @RequestParam(required = false) String password) {
        LinkShareDto link = shareService.validateAndGetLink(token, password);
        return ResponseEntity.ok(ApiResponse.success(link));
    }

    @DeleteMapping("/api/public-links/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Revoke a public share link")
    public ResponseEntity<ApiResponse<Void>> revokeLink(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        shareService.revokeLink(id, user);
        return ResponseEntity.ok(ApiResponse.success("Link revoked", null));
    }
}
