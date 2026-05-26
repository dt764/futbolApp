package com.futbolapp.commentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "player-service")
public interface PlayerServiceClient {

    @GetMapping("/api/players/hello")
    Map<String, Object> hello();
}
