package com.cloudstorage.repository;

import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.model.Folder;
import com.cloudstorage.model.Share;
import com.cloudstorage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShareRepository extends JpaRepository<Share, UUID> {

    List<Share> findBySharedWith(User sharedWith);

    List<Share> findByFile(FileMetadata file);

    List<Share> findByFolder(Folder folder);

    Optional<Share> findByFileAndSharedWith(FileMetadata file, User sharedWith);

    Optional<Share> findByFolderAndSharedWith(Folder folder, User sharedWith);

    boolean existsByFileAndSharedWith(FileMetadata file, User sharedWith);

    boolean existsByFolderAndSharedWith(Folder folder, User sharedWith);

    @Query("SELECT s FROM Share s WHERE s.sharedWith = :user AND s.file IS NOT NULL " +
           "AND s.file.deletedAt IS NULL AND s.file.uploadComplete = true")
    List<Share> findAllSharedFilesWithUser(@Param("user") User user);

    @Query("SELECT s FROM Share s WHERE s.sharedWith = :user AND s.folder IS NOT NULL " +
           "AND s.folder.deletedAt IS NULL")
    List<Share> findAllSharedFoldersWithUser(@Param("user") User user);
}
