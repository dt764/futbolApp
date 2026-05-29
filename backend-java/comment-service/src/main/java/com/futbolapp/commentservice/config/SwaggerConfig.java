package com.futbolapp.commentservice.config;

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
                .title("FutbolApp API - Comment Service (DWSC)")
                .version("1.0.0")
                .description("API REST para gestión de comentarios - Backend Java"));
    }
}
