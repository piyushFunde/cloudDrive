package com.cloudstorage.service;

import com.cloudstorage.dto.request.CreateFolderRequest;
import com.cloudstorage.dto.request.MoveRequest;
import com.cloudstorage.dto.request.RenameRequest;
import com.cloudstorage.dto.response.FolderContentsDto;
import com.cloudstorage.dto.response.FolderDto;
import com.cloudstorage.exception.AccessDeniedException;
import com.cloudstorage.exception.ResourceNotFoundException;
import com.cloudstorage.model.Folder;
import com.cloudstorage.model.User;
import com.cloudstorage.model.enums.ActivityAction;
import com.cloudstorage.model.enums.ResourceType;
import com.cloudstorage.repository.FileMetadataRepository;
import com.cloudstorage.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FolderService {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private FileService fileService;

    @Autowired
    private ActivityService activityService;

    @Transactional
    public FolderDto createFolder(CreateFolderRequest request, User owner) {
        Folder parentFolder = null;
        if (request.getParentFolderId() != null) {
            parentFolder = folderRepository.findByIdAndDeletedAtIsNull(request.getParentFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", request.getParentFolderId()));
            if (!parentFolder.getOwner().getId().equals(owner.getId())) {
                throw new AccessDeniedException("You don't own the parent folder");
            }
        }

        Folder folder = Folder.builder()
                .name(request.getName())
                .owner(owner)
                .parentFolder(parentFolder)
                .build();

        folder = folderRepository.save(folder);
        activityService.log(owner, ActivityAction.CREATE_FOLDER, ResourceType.FOLDER, folder.getId(), folder.getName());
        return mapToFolderDto(folder);
    }

    @Transactional(readOnly = true)
    public FolderContentsDto getFolderContents(UUID folderId, User requester) {
        Folder folder = folderRepository.findByIdAndDeletedAtIsNull(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", folderId));
        assertCanRead(folder, requester);

        List<FolderDto> subFolders = folderRepository
                .findByOwnerAndParentFolderAndDeletedAtIsNull(requester, folder)
                .stream().map(this::mapToFolderDto).collect(Collectors.toList());

        List<com.cloudstorage.dto.response.FileDto> files = fileMetadataRepository
                .findByOwnerAndFolderAndDeletedAtIsNullAndUploadCompleteTrue(requester, folder)
                .stream().map(fileService::mapToFileDto).collect(Collectors.toList());

        return FolderContentsDto.builder()
                .currentFolder(mapToFolderDto(folder))
                .folders(subFolders)
                .files(files)
                .build();
    }

    @Transactional(readOnly = true)
    public FolderContentsDto getRootContents(User owner) {
        List<FolderDto> rootFolders = folderRepository
                .findByOwnerAndParentFolderIsNullAndDeletedAtIsNull(owner)
                .stream().map(this::mapToFolderDto).collect(Collectors.toList());

        List<com.cloudstorage.dto.response.FileDto> rootFiles = fileMetadataRepository
                .findByOwnerAndFolderIsNullAndDeletedAtIsNullAndUploadCompleteTrue(owner)
                .stream().map(fileService::mapToFileDto).collect(Collectors.toList());

        return FolderContentsDto.builder()
                .currentFolder(null)
                .folders(rootFolders)
                .files(rootFiles)
                .build();
    }

    @Transactional
    public FolderDto renameFolder(UUID folderId, RenameRequest request, User requester) {
        Folder folder = getOwnedFolder(folderId, requester);
        folder.setName(request.getName());
        folder = folderRepository.save(folder);
        activityService.log(requester, ActivityAction.RENAME, ResourceType.FOLDER, folder.getId(), folder.getName());
        return mapToFolderDto(folder);
    }

    @Transactional
    public FolderDto moveFolder(UUID folderId, MoveRequest request, User requester) {
        Folder folder = getOwnedFolder(folderId, requester);

        Folder targetFolder = null;
        if (request.getTargetFolderId() != null) {
            if (request.getTargetFolderId().equals(folderId)) {
                throw new IllegalArgumentException("Cannot move a folder into itself");
            }
            targetFolder = folderRepository.findByIdAndDeletedAtIsNull(request.getTargetFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", request.getTargetFolderId()));
            if (!targetFolder.getOwner().getId().equals(requester.getId())) {
                throw new AccessDeniedException("Target folder does not belong to you");
            }
        }

        folder.setParentFolder(targetFolder);
        folder = folderRepository.save(folder);
        activityService.log(requester, ActivityAction.MOVE, ResourceType.FOLDER, folder.getId(), folder.getName());
        return mapToFolderDto(folder);
    }

    @Transactional
    public void softDelete(UUID folderId, User requester) {
        Folder folder = getOwnedFolder(folderId, requester);
        softDeleteRecursive(folder);
        activityService.log(requester, ActivityAction.DELETE, ResourceType.FOLDER, folder.getId(), folder.getName());
    }

    private void softDeleteRecursive(Folder folder) {
        folder.setDeletedAt(Instant.now());
        // Soft delete all files in this folder
        fileMetadataRepository.findByOwnerAndFolderAndDeletedAtIsNullAndUploadCompleteTrue(folder.getOwner(), folder)
                .forEach(f -> f.setDeletedAt(Instant.now()));
        // Recursively soft delete subfolders
        folder.getSubFolders().stream()
                .filter(sf -> sf.getDeletedAt() == null)
                .forEach(this::softDeleteRecursive);
        folderRepository.save(folder);
    }

    private Folder getOwnedFolder(UUID folderId, User requester) {
        Folder folder = folderRepository.findByIdAndDeletedAtIsNull(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", folderId));
        if (!folder.getOwner().getId().equals(requester.getId())) {
            throw new AccessDeniedException("You don't own this folder");
        }
        return folder;
    }

    private void assertCanRead(Folder folder, User requester) {
        if (!folder.getOwner().getId().equals(requester.getId())) {
            throw new AccessDeniedException("You don't have permission to access this folder");
        }
    }

    public FolderDto mapToFolderDto(Folder folder) {
        List<FolderDto.BreadcrumbItem> breadcrumb = buildBreadcrumb(folder);
        long fileCount = fileMetadataRepository
                .findByOwnerAndFolderAndDeletedAtIsNullAndUploadCompleteTrue(folder.getOwner(), folder).size();
        long subFolderCount = folderRepository.countByParentFolderIdAndDeletedAtIsNull(folder.getId());

        return FolderDto.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentFolderId(folder.getParentFolder() != null ? folder.getParentFolder().getId() : null)
                .parentFolderName(folder.getParentFolder() != null ? folder.getParentFolder().getName() : null)
                .fileCount(fileCount)
                .subFolderCount(subFolderCount)
                .breadcrumb(breadcrumb)
                .createdAt(folder.getCreatedAt())
                .build();
    }

    private List<FolderDto.BreadcrumbItem> buildBreadcrumb(Folder folder) {
        List<FolderDto.BreadcrumbItem> breadcrumb = new ArrayList<>();
        Folder current = folder;
        while (current != null) {
            breadcrumb.add(0, FolderDto.BreadcrumbItem.builder()
                    .id(current.getId())
                    .name(current.getName())
                    .build());
            current = current.getParentFolder();
        }
        return breadcrumb;
    }
}
