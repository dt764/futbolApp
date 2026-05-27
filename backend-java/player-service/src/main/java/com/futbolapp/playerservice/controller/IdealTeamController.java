package com.futbolapp.playerservice.controller;

import com.futbolapp.playerservice.dto.*;
import com.futbolapp.playerservice.service.GroqService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@RestController
@RequestMapping("/api/ideal-team")
@Tag(name = "Equipo Ideal", description = "Generacion de equipo ideal con Groq")
public class IdealTeamController {

    private final GroqService groqService;

    public IdealTeamController(GroqService groqService) {
        this.groqService = groqService;
    }

    @PostMapping
    @Operation(summary = "Generar equipo ideal con Groq (autenticado)")
    public ResponseEntity<?> generate(@Valid @RequestBody IdealTeamRequest request) {
        String userId = (String) getRequest().getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        try {
            IdealTeamResponse response = groqService.generateIdealTeam(request.getFormation(), request.getSource());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (GroqService.GroqApiException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", "Error al contactar con Groq", "detail", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al generar el equipo ideal", "detail", e.getMessage()));
        }
    }

    private jakarta.servlet.http.HttpServletRequest getRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    }
}
