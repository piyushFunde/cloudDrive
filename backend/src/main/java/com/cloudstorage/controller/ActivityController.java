package com.cloudstorage.controller;

import com.cloudstorage.dto.response.ApiResponse;
import com.cloudstorage.model.Activity;
import com.cloudstorage.model.User;
import com.cloudstorage.security.CustomUserDetailsService;
import com.cloudstorage.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Activity", description = "User activity log")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @GetMapping
    @Operation(summary = "Get current user's activity log")
    public ResponseEntity<ApiResponse<List<Activity>>> getActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<Activity> activities = activityService.getUserActivity(user, page, size);
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
