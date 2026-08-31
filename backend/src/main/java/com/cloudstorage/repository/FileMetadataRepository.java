package com.cloudstorage.repository;

import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.model.Folder;
import com.cloudstorage.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID> {

    List<FileMetadata> findByOwnerAndFolderIsNullAndDeletedAtIsNullAndUploadCompleteTrue(User owner);

    List<FileMetadata> findByOwnerAndFolderAndDeletedAtIsNullAndUploadCompleteTrue(User owner, Folder folder);

    List<FileMetadata> findByOwnerAndIsStarredTrueAndDeletedAtIsNull(User owner);

    List<FileMetadata> findByOwnerAndDeletedAtIsNotNull(User owner);

    Optional<FileMetadata> findByIdAndDeletedAtIsNull(UUID id);

    @Query("SELECT f FROM FileMetadata f WHERE f.owner = :owner AND f.deletedAt IS NULL " +
           "AND f.uploadComplete = true AND LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<FileMetadata> searchByName(@Param("owner") User owner, @Param("query") String query, Pageable pageable);

    @Query("SELECT f FROM FileMetadata f WHERE f.owner = :owner AND f.deletedAt IS NULL " +
           "AND f.uploadComplete = true AND LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "AND f.mimeType LIKE CONCAT(:mimePrefix, '%')")
    Page<FileMetadata> searchByNameAndMimeType(@Param("owner") User owner,
                                               @Param("query") String query,
                                               @Param("mimePrefix") String mimePrefix,
                                               Pageable pageable);

    @Query("SELECT SUM(f.size) FROM FileMetadata f WHERE f.owner.id = :userId AND f.deletedAt IS NULL")
    Optional<Long> sumSizeByOwnerIdAndDeletedAtIsNull(@Param("userId") UUID userId);

    boolean existsByIdAndDeletedAtIsNull(UUID id);
}
