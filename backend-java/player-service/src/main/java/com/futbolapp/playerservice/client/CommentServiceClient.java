package com.futbolapp.playerservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "comment-service")
public interface CommentServiceClient {

    @GetMapping("/api/comments/count-by-player/{playerId}")
    Map<String, Object> getCountByPlayer(@PathVariable("playerId") String playerId);
}
