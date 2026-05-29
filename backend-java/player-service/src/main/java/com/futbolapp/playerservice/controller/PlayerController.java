package com.futbolapp.playerservice.controller;

import com.futbolapp.playerservice.client.CommentServiceClient;
import com.futbolapp.playerservice.dto.*;
import com.futbolapp.playerservice.service.PlayerService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/players")
@Tag(name = "Jugadores", description = "Gestion de jugadores")
public class PlayerController {

    private final PlayerService playerService;
    private final CommentServiceClient commentServiceClient;

    public PlayerController(PlayerService playerService, CommentServiceClient commentServiceClient) {
        this.playerService = playerService;
        this.commentServiceClient = commentServiceClient;
    }

    @GetMapping
    @Operation(summary = "Listar jugadores (publico)")
    public ResponseEntity<PlayerListResponse> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String league,
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) String createdFrom,
            @RequestParam(required = false) String createdTo,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(playerService.list(name, team, league, createdBy, createdFrom, createdTo, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener jugador por ID (publico)")
    @ApiResponse(responseCode = "200", description = "Datos del jugador")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    @CircuitBreaker(name = "commentService", fallbackMethod = "getByIdFallback")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable String id) {
        PlayerResponse response = new PlayerResponse(playerService.getById(id));

        try {
            Map<String, Object> commentData = commentServiceClient.getCountByPlayer(id);
            if (commentData != null && commentData.get("count") != null) {
                response.setCommentCount(((Number) commentData.get("count")).intValue());
            } else {
                response.setCommentCount(0);
            }
        } catch (Exception e) {
            response.setCommentCount(0);
        }

        return ResponseEntity.ok(Map.of("player", response));
    }

    public ResponseEntity<Map<String, Object>> getByIdFallback(String id, Throwable t) {
        PlayerResponse response = new PlayerResponse(playerService.getById(id));
        response.setCommentCount(0);
        return ResponseEntity.ok(Map.of("player", response));
    }

    @GetMapping("/{id}/exists")
    @Operation(summary = "Verificar si un jugador existe (usado via Feign)")
    public ResponseEntity<Map<String, Object>> existsById(@PathVariable String id) {
        boolean exists = playerService.existsById(id);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/search/external")
    @Operation(summary = "Buscar jugadores en API externa (autenticado)")
    public ResponseEntity<?> searchExternal(
            HttpServletRequest request,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String league,
            @RequestParam(defaultValue = "1") int page) {
        if (request.getAttribute("userId") == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }
        try {
            Map<String, Object> data = playerService.searchExternal(name, team, league, page);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("error", "Error al consultar la API externa de futbol"));
        }
    }

    @PostMapping("/import")
    @Operation(summary = "Importar jugador desde API externa (autenticado)")
    @ApiResponse(responseCode = "201", description = "Jugador importado")
    @ApiResponse(responseCode = "409", description = "El jugador ya existe")
    public ResponseEntity<?> importFromApi(HttpServletRequest request, @Valid @RequestBody PlayerImportRequest req) {
        if (request.getAttribute("userId") == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }
        try {
            PlayerResponse response = new PlayerResponse(playerService.importFromApi(req, (String) request.getAttribute("userId")));
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("player", response));
        } catch (PlayerService.ConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/manual")
    @Operation(summary = "Crear jugador manualmente (autenticado)")
    @ApiResponse(responseCode = "201", description = "Jugador creado")
    public ResponseEntity<?> create(HttpServletRequest request, @Valid @RequestBody PlayerCreateRequest req) {
        if (request.getAttribute("userId") == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }
        PlayerResponse response = new PlayerResponse(playerService.create(req, (String) request.getAttribute("userId")));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("player", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar jugador (admin)")
    public ResponseEntity<?> update(HttpServletRequest request, @PathVariable String id,
                                     @RequestBody PlayerUpdateRequest req) {
        if (!"admin".equals(request.getAttribute("userRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para esta accion"));
        }
        try {
            PlayerResponse response = new PlayerResponse(playerService.update(id, req));
            return ResponseEntity.ok(Map.of("player", response));
        } catch (PlayerService.NotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar jugador (admin)")
    public ResponseEntity<?> delete(HttpServletRequest request, @PathVariable String id) {
        if (!"admin".equals(request.getAttribute("userRole"))) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para esta accion"));
        }
        try {
            playerService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Jugador eliminado correctamente"));
        } catch (PlayerService.NotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

}
