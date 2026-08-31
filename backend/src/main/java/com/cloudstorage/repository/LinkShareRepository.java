package com.cloudstorage.repository;

import com.cloudstorage.model.LinkShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LinkShareRepository extends JpaRepository<LinkShare, UUID> {

    Optional<LinkShare> findByToken(String token);

    @Query("SELECT ls FROM LinkShare ls WHERE ls.file.id = :fileId")
    List<LinkShare> findByFileId(@Param("fileId") UUID fileId);

    @Query("SELECT ls FROM LinkShare ls WHERE ls.folder.id = :folderId")
    List<LinkShare> findByFolderId(@Param("folderId") UUID folderId);

    @Query("SELECT ls FROM LinkShare ls WHERE ls.expiresAt IS NOT NULL AND ls.expiresAt < :now")
    List<LinkShare> findExpiredLinks(@Param("now") Instant now);
}
