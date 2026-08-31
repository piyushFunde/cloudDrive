package com.cloudstorage.repository;

import com.cloudstorage.model.Activity;
import com.cloudstorage.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    Page<Activity> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
