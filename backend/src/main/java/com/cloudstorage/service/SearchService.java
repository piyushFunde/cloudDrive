package com.cloudstorage.service;

import com.cloudstorage.dto.response.FileDto;
import com.cloudstorage.dto.response.FolderDto;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.FileMetadataRepository;
import com.cloudstorage.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private FileService fileService;

    @Autowired
    private FolderService folderService;

    @Transactional(readOnly = true)
    public SearchResult search(String query, String mimeTypeFilter, int page, int size, User owner) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        List<FileDto> files;
        if (mimeTypeFilter != null && !mimeTypeFilter.isBlank()) {
            files = fileMetadataRepository
                    .searchByNameAndMimeType(owner, query, mimeTypeFilter, pageable)
                    .stream().map(fileService::mapToFileDto).collect(Collectors.toList());
        } else {
            files = fileMetadataRepository
                    .searchByName(owner, query, pageable)
                    .stream().map(fileService::mapToFileDto).collect(Collectors.toList());
        }

        List<FolderDto> folders = (mimeTypeFilter == null || mimeTypeFilter.isBlank())
                ? folderRepository.searchByName(owner, query)
                    .stream().map(folderService::mapToFolderDto).collect(Collectors.toList())
                : List.of();

        return new SearchResult(files, folders);
    }

    public record SearchResult(List<FileDto> files, List<FolderDto> folders) {}
}
