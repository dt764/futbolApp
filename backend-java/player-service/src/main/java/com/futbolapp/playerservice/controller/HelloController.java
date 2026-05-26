package com.futbolapp.playerservice.controller;

import com.futbolapp.playerservice.client.CommentServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class HelloController {

    private final CommentServiceClient commentClient;

    @Value("${spring.application.name}")
    private String serviceName;

    @Value("${server.port}")
    private int port;

    public HelloController(CommentServiceClient commentClient) {
        this.commentClient = commentClient;
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
        Map<String, Object> response = commentClient.hello();
        return Map.of(
            "service", serviceName,
            "port", port,
            "called", response
        );
    }
}
