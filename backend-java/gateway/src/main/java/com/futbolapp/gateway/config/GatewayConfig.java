package com.futbolapp.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("players", r -> r.path("/api/players/**", "/api/auth/**", "/api/external/**")
                .uri("lb://player-service"))
            .route("comments", r -> r.path("/api/comments/**")
                .uri("lb://comment-service"))
            .build();
    }
}
