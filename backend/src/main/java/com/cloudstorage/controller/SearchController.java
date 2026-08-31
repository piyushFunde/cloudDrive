package com.cloudstorage.controller;

import com.cloudstorage.dto.response.ApiResponse;
import com.cloudstorage.model.User;
import com.cloudstorage.security.CustomUserDetailsService;
import com.cloudstorage.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Search", description = "Full-text search across files and folders")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @GetMapping
    @Operation(summary = "Search files and folders by name, with optional MIME type filter")
    public ResponseEntity<ApiResponse<SearchService.SearchResult>> search(
            @RequestParam String q,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        SearchService.SearchResult result = searchService.search(q, type, page, size, user);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
