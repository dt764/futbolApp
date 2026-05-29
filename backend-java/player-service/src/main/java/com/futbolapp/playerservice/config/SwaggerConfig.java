package com.futbolapp.playerservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Value("${springdoc.api-docs.server-url:https://tactixi.duckdns.org}")
    private String serverUrl;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .addServersItem(new Server().url(serverUrl))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Token de Firebase (idToken)")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .info(new Info()
                .title("FutbolApp API - Player Service (DWSC)")
                .version("1.0.0")
                .description("API REST para gestión de jugadores y estadísticas de fútbol - Backend Java"));
    }
}
