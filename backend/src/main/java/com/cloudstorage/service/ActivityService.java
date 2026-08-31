package com.cloudstorage.service;

import com.cloudstorage.model.Activity;
import com.cloudstorage.model.User;
import com.cloudstorage.model.enums.ActivityAction;
import com.cloudstorage.model.enums.ResourceType;
import com.cloudstorage.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Async
    public void log(User user, ActivityAction action, ResourceType resourceType, UUID resourceId, String resourceName) {
        try {
            Activity activity = Activity.builder()
                    .user(user)
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .resourceName(resourceName)
                    .build();
            activityRepository.save(activity);
        } catch (Exception e) {
            // Activity logging should never fail silently
        }
    }

    public List<Activity> getUserActivity(User user, int page, int size) {
        return activityRepository
                .findByUserOrderByCreatedAtDesc(user, PageRequest.of(page, size))
                .getContent();
    }
}
