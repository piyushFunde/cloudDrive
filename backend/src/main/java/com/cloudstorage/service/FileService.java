package com.cloudstorage.service;

import com.cloudstorage.dto.request.CompleteUploadRequest;
import com.cloudstorage.dto.request.InitUploadRequest;
import com.cloudstorage.dto.request.MoveRequest;
import com.cloudstorage.dto.request.RenameRequest;
import com.cloudstorage.dto.response.FileDto;
import com.cloudstorage.dto.response.UploadInitResponse;
import com.cloudstorage.exception.AccessDeniedException;
import com.cloudstorage.exception.ResourceNotFoundException;
import com.cloudstorage.model.FileMetadata;
import com.cloudstorage.model.Folder;
import com.cloudstorage.model.User;
import com.cloudstorage.model.enums.ActivityAction;
import com.cloudstorage.model.enums.ResourceType;
import com.cloudstorage.repository.FileMetadataRepository;
import com.cloudstorage.repository.FolderRepository;
import com.cloudstorage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileService {

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private ActivityService activityService;

    /**
     * Step 1 of upload: Create a pending FileMetadata record and return a presigned upload URL.
     */
    @Transactional
    public UploadInitResponse initUpload(InitUploadRequest request, User owner) {
        // Validate folder access
        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findByIdAndDeletedAtIsNull(request.getFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", request.getFolderId()));
            if (!folder.getOwner().getId().equals(owner.getId())) {
                throw new AccessDeniedException("You don't own this folder");
            }
        }

        // Generate a unique storage key
        String storageKey = "users/" + owner.getId() + "/files/" + UUID.randomUUID() + "/" + sanitizeFileName(request.getFileName());

        // Create pending file record (uploadComplete = false)
        FileMetadata fileMeta = FileMetadata.builder()
                .name(request.getFileName())
                .mimeType(request.getMimeType())
                .size(request.getSize())
                .storageKey(storageKey)
                .owner(owner)
                .folder(folder)
                .uploadComplete(false)
                .isStarred(false)
                .build();

        fileMeta = fileMetadataRepository.save(fileMeta);

        // Generate presigned upload URL
        String uploadUrl = storageService.generatePresignedUploadUrl(storageKey, request.getMimeType(), request.getSize());

        return UploadInitResponse.builder()
                .fileId(fileMeta.getId())
                .uploadUrl(uploadUrl)
                .storageKey(storageKey)
                .storageProvider(storageService.getProviderName())
                .build();
    }

    /**
     * Step 2 of upload: Mark the file as complete and update user storage quota.
     */
    @Transactional
    public FileDto completeUpload(CompleteUploadRequest request, User owner) {
        FileMetadata fileMeta = fileMetadataRepository.findById(request.getFileId())
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", request.getFileId()));

        if (!fileMeta.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You don't own this file");
        }

        fileMeta.setUploadComplete(true);
        fileMeta = fileMetadataRepository.save(fileMeta);

        // Update storage usage
        userRepository.updateStorageUsed(owner.getId(), fileMeta.getSize());

        activityService.log(owner, ActivityAction.UPLOAD, ResourceType.FILE, fileMeta.getId(), fileMeta.getName());

        return mapToFileDto(fileMeta);
    }

    @Transactional(readOnly = true)
    public FileDto getFile(UUID fileId, User requester) {
        FileMetadata file = fileMetadataRepository.findByIdAndDeletedAtIsNull(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", fileId));
        assertCanRead(file, requester);
        return mapToFileDto(file);
    }

    @Transactional(readOnly = true)
    public List<FileDto> listRootFiles(User owner) {
        return fileMetadataRepository
                .findByOwnerAndFolderIsNullAndDeletedAtIsNullAndUploadCompleteTrue(owner)
                .stream().map(this::mapToFileDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FileDto> listFilesInFolder(UUID folderId, User owner) {
        Folder folder = folderRepository.findByIdAndDeletedAtIsNull(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", folderId));
        return fileMetadataRepository
                .findByOwnerAndFolderAndDeletedAtIsNullAndUploadCompleteTrue(owner, folder)
                .stream().map(this::mapToFileDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FileDto> getStarredFiles(User owner) {
        return fileMetadataRepository.findByOwnerAndIsStarredTrueAndDeletedAtIsNull(owner)
                .stream().map(this::mapToFileDto).collect(Collectors.toList());
    }

    @Transactional
    public FileDto renameFile(UUID fileId, RenameRequest request, User requester) {
        FileMetadata file = getOwnedFile(fileId, requester);
        file.setName(request.getName());
        file = fileMetadataRepository.save(file);
        activityService.log(requester, ActivityAction.RENAME, ResourceType.FILE, file.getId(), file.getName());
        return mapToFileDto(file);
    }

    @Transactional
    public FileDto moveFile(UUID fileId, MoveRequest request, User requester) {
        FileMetadata file = getOwnedFile(fileId, requester);

        Folder targetFolder = null;
        if (request.getTargetFolderId() != null) {
            targetFolder = folderRepository.findByIdAndDeletedAtIsNull(request.getTargetFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", request.getTargetFolderId()));
            if (!targetFolder.getOwner().getId().equals(requester.getId())) {
                throw new AccessDeniedException("Target folder does not belong to you");
            }
        }

        file.setFolder(targetFolder);
        file = fileMetadataRepository.save(file);
        activityService.log(requester, ActivityAction.MOVE, ResourceType.FILE, file.getId(), file.getName());
        return mapToFileDto(file);
    }

    @Transactional
    public FileDto toggleStar(UUID fileId, User requester) {
        FileMetadata file = getOwnedFile(fileId, requester);
        file.setIsStarred(!file.getIsStarred());
        file = fileMetadataRepository.save(file);
        activityService.log(requester,
                file.getIsStarred() ? ActivityAction.STAR : ActivityAction.UNSTAR,
                ResourceType.FILE, file.getId(), file.getName());
        return mapToFileDto(file);
    }

    @Transactional
    public void softDelete(UUID fileId, User requester) {
        FileMetadata file = getOwnedFile(fileId, requester);
        file.setDeletedAt(Instant.now());
        fileMetadataRepository.save(file);
        activityService.log(requester, ActivityAction.DELETE, ResourceType.FILE, file.getId(), file.getName());
    }

    private FileMetadata getOwnedFile(UUID fileId, User requester) {
        FileMetadata file = fileMetadataRepository.findByIdAndDeletedAtIsNull(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", fileId));
        if (!file.getOwner().getId().equals(requester.getId())) {
            throw new AccessDeniedException("You don't own this file");
        }
        return file;
    }

    private void assertCanRead(FileMetadata file, User requester) {
        if (!file.getOwner().getId().equals(requester.getId())) {
            throw new AccessDeniedException("You don't have permission to access this file");
        }
    }

    public FileDto mapToFileDto(FileMetadata file) {
        String downloadUrl = null;
        if (Boolean.TRUE.equals(file.getUploadComplete())) {
            downloadUrl = storageService.generatePresignedDownloadUrl(file.getStorageKey(), file.getName());
        }

        return FileDto.builder()
                .id(file.getId())
                .name(file.getName())
                .mimeType(file.getMimeType())
                .size(file.getSize())
                .downloadUrl(downloadUrl)
                .isStarred(file.getIsStarred())
                .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
                .folderName(file.getFolder() != null ? file.getFolder().getName() : null)
                .owner(FileDto.OwnerInfo.builder()
                        .id(file.getOwner().getId())
                        .name(file.getOwner().getName())
                        .email(file.getOwner().getEmail())
                        .build())
                .createdAt(file.getCreatedAt())
                .deletedAt(file.getDeletedAt())
                .build();
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
