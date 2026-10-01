package com.example.s3lambda;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class S3Controller {

    private final S3Client s3Client;
    private final String bucketName;
    private final String folder;

    public S3Controller(
            @Value("${aws.region}") String region,
            @Value("${aws.s3.bucket}") String bucketName,
            @Value("${aws.s3.folder}") String folder
    ) {
        this.bucketName = bucketName;
        this.folder = folder.endsWith("/") ? folder : folder + "/";

        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .build();
    }

    @PostMapping(
            value = "/files/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public UploadResponse uploadFile(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file.");
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("Invalid file name.");
        }

        String key = folder + fileName;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(
                        file.getContentType() != null
                                ? file.getContentType()
                                : "application/octet-stream"
                )
                .build();

        s3Client.putObject(
                request,
                RequestBody.fromBytes(file.getBytes())
        );

        return new UploadResponse(
                "File uploaded successfully",
                fileName,
                key
        );
    }

    @GetMapping("/files")
    public List<FileInfo> listFiles() {

        ListObjectsV2Request request = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .prefix(folder)
                .build();

        ListObjectsV2Response response =
                s3Client.listObjectsV2(request);

        return response.contents()
                .stream()
                .map(object -> {

                    String key = object.key();

                    String fileName =
                            key.substring(folder.length());

                    return new FileInfo(
                            fileName,
                            key,
                            object.size(),
                            object.lastModified().toString()
                    );
                })
                .toList();
    }

    @DeleteMapping("/files/{fileName}")
    public DeleteResponse deleteFile(
            @PathVariable String fileName
    ) {

        String key = folder + fileName;

        DeleteObjectRequest request =
                DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();

        s3Client.deleteObject(request);

        return new DeleteResponse(
                "File deleted successfully",
                fileName
        );
    }

    public record UploadResponse(
            String message,
            String fileName,
            String key
    ) {
    }

    public record DeleteResponse(
            String message,
            String fileName
    ) {
    }

    public record FileInfo(
            String name,
            String key,
            long size,
            String lastModified
    ) {
    }
}