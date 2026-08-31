package com.cloudstorage.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "file_metadata", indexes = {
        @Index(name = "idx_files_owner", columnList = "owner_id"),
        @Index(name = "idx_files_folder", columnList = "folder_id"),
        @Index(name = "idx_files_deleted", columnList = "deleted_at"),
        @Index(name = "idx_files_starred", columnList = "is_starred")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(name = "mime_type", length = 255)
    private String mimeType;

    @Column(nullable = false)
    private Long size;

    /**
     * The storage key (S3 object key or local file path).
     * For S3: "users/{userId}/files/{uuid}/{filename}"
     * For local: relative path under upload-dir
     */
    @Column(name = "storage_key", nullable = false, length = 1000)
    private String storageKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @Column(name = "is_starred", nullable = false)
    @Builder.Default
    private Boolean isStarred = false;

    @Column(name = "upload_complete", nullable = false)
    @Builder.Default
    private Boolean uploadComplete = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
