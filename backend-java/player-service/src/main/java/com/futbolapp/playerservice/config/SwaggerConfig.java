package com.futbolapp.playerservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Value("${server.port:8081}")
    private int port;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("FutbolApp API - Player Service (DWSC)")
                .version("1.0.0")
                .description("API REST para gestión de jugadores y estadísticas de fútbol - Backend Java"))
            .addServersItem(new Server()
                .url("http://localhost:" + port)
                .description("Servidor local"));
    }
}
