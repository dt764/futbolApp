package com.futbolapp.commentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "player-service")
public interface PlayerServiceClient {

    @GetMapping("/api/players/{id}/exists")
    Map<String, Object> existsById(@PathVariable("id") String id);
}
