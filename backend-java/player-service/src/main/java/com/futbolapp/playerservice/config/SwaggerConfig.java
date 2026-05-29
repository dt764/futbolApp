package com.futbolapp.playerservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("FutbolApp API - Player Service (DWSC)")
                .version("1.0.0")
                .description("API REST para gestión de jugadores y estadísticas de fútbol - Backend Java"));
    }
}
