package com.futbolapp.playerservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "comment-service")
public interface CommentServiceClient {

    @GetMapping("/api/comments/hello")
    Map<String, Object> hello();
}
