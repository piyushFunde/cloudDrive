package com.cloudstorage.repository;

import com.cloudstorage.model.Folder;
import com.cloudstorage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FolderRepository extends JpaRepository<Folder, UUID> {

    List<Folder> findByOwnerAndParentFolderIsNullAndDeletedAtIsNull(User owner);

    List<Folder> findByOwnerAndParentFolderAndDeletedAtIsNull(User owner, Folder parentFolder);

    List<Folder> findByOwnerAndDeletedAtIsNotNull(User owner);

    Optional<Folder> findByIdAndDeletedAtIsNull(UUID id);

    @Query("SELECT f FROM Folder f WHERE f.owner = :owner AND f.deletedAt IS NULL " +
           "AND LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Folder> searchByName(@Param("owner") User owner, @Param("query") String query);

    @Query("SELECT COUNT(f) FROM Folder f WHERE f.parentFolder.id = :parentId AND f.deletedAt IS NULL")
    long countByParentFolderIdAndDeletedAtIsNull(@Param("parentId") UUID parentId);
}
