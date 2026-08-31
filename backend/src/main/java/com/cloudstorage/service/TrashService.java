package com.cloudstorage.service;

import com.cloudstorage.dto.response.FileDto;
import com.cloudstorage.dto.response.FolderDto;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TrashService {

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private FileService fileService;

    @Autowired
    private FolderService folderService;

    @Autowired
    private ActivityService activityService;

    @Transactional(readOnly = true)
    public TrashContents listTrash(User owner) {
        List<FileDto> trashedFiles = fileMetadataRepository
                .findByOwnerAndDeletedAtIsNotNull(owner)
                .stream().map(fileService::mapToFileDto).collect(Collectors.toList());

        List<FolderDto> trashedFolders = folderRepository
                .findByOwnerAndDeletedAtIsNotNull(owner)
                .stream().map(folderService::mapToFolderDto).collect(Collectors.toList());

        return new TrashContents(trashedFiles, trashedFolders);
    }

    @Transactional
    public FileDto restoreFile(UUID fileId, User requester) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", fileId));
        file.setDeletedAt(null);
        file.setFolder(null); // Restore to root
        file = fileMetadataRepository.save(file);
        activityService.log(requester, ActivityAction.RESTORE, ResourceType.FILE, file.getId(), file.getName());
        return fileService.mapToFileDto(file);
    }

    @Transactional
    public FolderDto restoreFolder(UUID folderId, User requester) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", folderId));
        folder.setDeletedAt(null);
        folder.setParentFolder(null); // Restore to root
        folder = folderRepository.save(folder);
        activityService.log(requester, ActivityAction.RESTORE, ResourceType.FOLDER, folder.getId(), folder.getName());
        return folderService.mapToFolderDto(folder);
    }

    @Transactional
    public void permanentDeleteFile(UUID fileId, User requester) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", fileId));
        // Delete from storage
        storageService.deleteObject(file.getStorageKey());
        // Update storage usage
        userRepository.updateStorageUsed(requester.getId(), -file.getSize());
        activityService.log(requester, ActivityAction.PERMANENT_DELETE, ResourceType.FILE, file.getId(), file.getName());
        fileMetadataRepository.delete(file);
    }

    @Transactional
    public void permanentDeleteFolder(UUID folderId, User requester) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", folderId));
        // Permanently delete all files in folder
        fileMetadataRepository.findByOwnerAndDeletedAtIsNotNull(requester)
                .stream()
                .filter(f -> f.getFolder() != null && f.getFolder().getId().equals(folderId))
                .forEach(f -> {
                    storageService.deleteObject(f.getStorageKey());
                    userRepository.updateStorageUsed(requester.getId(), -f.getSize());
                    fileMetadataRepository.delete(f);
                });
        activityService.log(requester, ActivityAction.PERMANENT_DELETE, ResourceType.FOLDER, folder.getId(), folder.getName());
        folderRepository.delete(folder);
    }

    @Transactional
    public void emptyTrash(User owner) {
        // Delete all trashed files from storage and DB
        fileMetadataRepository.findByOwnerAndDeletedAtIsNotNull(owner).forEach(file -> {
            storageService.deleteObject(file.getStorageKey());
            userRepository.updateStorageUsed(owner.getId(), -file.getSize());
            fileMetadataRepository.delete(file);
        });
        // Delete all trashed folders
        folderRepository.findByOwnerAndDeletedAtIsNotNull(owner).forEach(folderRepository::delete);
    }

    public record TrashContents(List<FileDto> files, List<FolderDto> folders) {}
}
