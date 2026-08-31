package com.cloudstorage.service;

import com.cloudstorage.dto.request.CreateLinkShareRequest;
import com.cloudstorage.dto.request.ShareRequest;
import com.cloudstorage.dto.response.LinkShareDto;
import com.cloudstorage.dto.response.ShareDto;
import com.cloudstorage.exception.AccessDeniedException;
import com.cloudstorage.exception.InvalidTokenException;
import com.cloudstorage.exception.ResourceNotFoundException;
import com.cloudstorage.model.*;
import com.cloudstorage.model.enums.ActivityAction;
import com.cloudstorage.model.enums.ResourceType;
import com.cloudstorage.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShareService {

    @Autowired
    private ShareRepository shareRepository;

    @Autowired
    private LinkShareRepository linkShareRepository;

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ActivityService activityService;

    @Value("${app.storage.local.base-url:http://localhost:8080}")
    private String baseUrl;

    @Transactional
    public ShareDto shareWithUser(ShareRequest request, User sharer) {
        User targetUser = userRepository.findByEmail(request.getTargetEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getTargetEmail()));

        if (targetUser.getId().equals(sharer.getId())) {
            throw new IllegalArgumentException("Cannot share with yourself");
        }

        Share share;
        if (request.getResourceType() == ResourceType.FILE) {
            FileMetadata file = fileMetadataRepository.findByIdAndDeletedAtIsNull(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("File", "id", request.getResourceId()));
            if (!file.getOwner().getId().equals(sharer.getId())) {
                throw new AccessDeniedException("You don't own this file");
            }
            // Remove existing share if any
            shareRepository.findByFileAndSharedWith(file, targetUser).ifPresent(shareRepository::delete);

            share = Share.builder()
                    .file(file)
                    .sharedBy(sharer)
                    .sharedWith(targetUser)
                    .role(request.getRole())
                    .build();
        } else {
            Folder folder = folderRepository.findByIdAndDeletedAtIsNull(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", request.getResourceId()));
            if (!folder.getOwner().getId().equals(sharer.getId())) {
                throw new AccessDeniedException("You don't own this folder");
            }
            shareRepository.findByFolderAndSharedWith(folder, targetUser).ifPresent(shareRepository::delete);

            share = Share.builder()
                    .folder(folder)
                    .sharedBy(sharer)
                    .sharedWith(targetUser)
                    .role(request.getRole())
                    .build();
        }

        share = shareRepository.save(share);
        activityService.log(sharer, ActivityAction.SHARE, request.getResourceType(), request.getResourceId(), null);
        return mapToShareDto(share);
    }

    @Transactional
    public LinkShareDto createPublicLink(CreateLinkShareRequest request, User creator) {
        String token = UUID.randomUUID().toString().replace("-", "");

        LinkShare linkShare = LinkShare.builder()
                .token(token)
                .createdBy(creator)
                .role(request.getRole())
                .expiresAt(request.getExpiresAt())
                .passwordHash(request.getPassword() != null ? passwordEncoder.encode(request.getPassword()) : null)
                .accessCount(0L)
                .build();

        if (request.getResourceType() == ResourceType.FILE) {
            FileMetadata file = fileMetadataRepository.findByIdAndDeletedAtIsNull(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("File", "id", request.getResourceId()));
            if (!file.getOwner().getId().equals(creator.getId())) throw new AccessDeniedException();
            linkShare.setFile(file);
        } else {
            Folder folder = folderRepository.findByIdAndDeletedAtIsNull(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", request.getResourceId()));
            if (!folder.getOwner().getId().equals(creator.getId())) throw new AccessDeniedException();
            linkShare.setFolder(folder);
        }

        linkShare = linkShareRepository.save(linkShare);
        activityService.log(creator, ActivityAction.CREATE_LINK, request.getResourceType(), request.getResourceId(), null);
        return mapToLinkShareDto(linkShare);
    }

    @Transactional
    public LinkShareDto validateAndGetLink(String token, String password) {
        LinkShare link = linkShareRepository.findByToken(token)
                .orElseThrow(InvalidTokenException::new);

        if (link.isExpired()) {
            throw new InvalidTokenException("This share link has expired");
        }

        if (link.hasPassword()) {
            if (password == null || !passwordEncoder.matches(password, link.getPasswordHash())) {
                throw new InvalidTokenException("Incorrect password for this link");
            }
        }

        link.setAccessCount(link.getAccessCount() + 1);
        linkShareRepository.save(link);
        return mapToLinkShareDto(link);
    }

    @Transactional(readOnly = true)
    public List<ShareDto> getSharesForUser(User user) {
        return shareRepository.findBySharedWith(user)
                .stream().map(this::mapToShareDto).collect(Collectors.toList());
    }

    @Transactional
    public void revokeShare(UUID shareId, User requester) {
        Share share = shareRepository.findById(shareId)
                .orElseThrow(() -> new ResourceNotFoundException("Share", "id", shareId));
        if (!share.getSharedBy().getId().equals(requester.getId())) {
            throw new AccessDeniedException("Only the owner can revoke shares");
        }
        shareRepository.delete(share);
    }

    @Transactional
    public void revokeLink(UUID linkId, User requester) {
        LinkShare link = linkShareRepository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException("Link share", "id", linkId));
        if (!link.getCreatedBy().getId().equals(requester.getId())) {
            throw new AccessDeniedException("Only the creator can revoke this link");
        }
        linkShareRepository.delete(link);
    }

    private ShareDto mapToShareDto(Share share) {
        String resourceName = share.getFile() != null ? share.getFile().getName() : share.getFolder().getName();
        UUID resourceId = share.getFile() != null ? share.getFile().getId() : share.getFolder().getId();
        String resourceType = share.getFile() != null ? "FILE" : "FOLDER";

        return ShareDto.builder()
                .id(share.getId())
                .resource(ShareDto.SharedResource.builder().id(resourceId).name(resourceName).type(resourceType).build())
                .sharedWith(ShareDto.SharedUser.builder()
                        .id(share.getSharedWith().getId()).name(share.getSharedWith().getName())
                        .email(share.getSharedWith().getEmail()).build())
                .sharedBy(ShareDto.SharedUser.builder()
                        .id(share.getSharedBy().getId()).name(share.getSharedBy().getName())
                        .email(share.getSharedBy().getEmail()).build())
                .role(share.getRole())
                .createdAt(share.getCreatedAt())
                .build();
    }

    private LinkShareDto mapToLinkShareDto(LinkShare link) {
        String resourceName = link.getFile() != null ? link.getFile().getName() : link.getFolder().getName();
        UUID resourceId = link.getFile() != null ? link.getFile().getId() : link.getFolder().getId();
        String resourceType = link.getFile() != null ? "FILE" : "FOLDER";

        return LinkShareDto.builder()
                .id(link.getId())
                .token(link.getToken())
                .shareUrl(baseUrl.replace(":8080", ":5173") + "/share/" + link.getToken())
                .role(link.getRole())
                .hasPassword(link.hasPassword())
                .expiresAt(link.getExpiresAt())
                .accessCount(link.getAccessCount())
                .resource(LinkShareDto.SharedResource.builder().id(resourceId).name(resourceName).type(resourceType).build())
                .createdAt(link.getCreatedAt())
                .build();
    }
}
