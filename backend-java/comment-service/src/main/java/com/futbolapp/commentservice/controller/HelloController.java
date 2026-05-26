package com.futbolapp.commentservice.controller;

import com.futbolapp.commentservice.client.PlayerServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class HelloController {

    private final PlayerServiceClient playerClient;

    @Value("${spring.application.name}")
    private String serviceName;

    @Value("${server.port}")
    private int port;

    public HelloController(PlayerServiceClient playerClient) {
        this.playerClient = playerClient;
    }

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of(
            "service", serviceName,
            "port", port,
            "message", "Hello from " + serviceName
        );
    }

    @GetMapping("/feign-hello")
    public Map<String, Object> feignHello() {
        Map<String, Object> response = playerClient.hello();
        return Map.of(
            "service", serviceName,
            "port", port,
            "called", response
        );
    }
}
