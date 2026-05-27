package com.futbolapp.commentservice.controller;

import com.futbolapp.commentservice.dto.*;
import com.futbolapp.commentservice.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@Tag(name = "Comentarios", description = "Gestion de comentarios de jugadores")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/player/{playerId}")
    @Operation(summary = "Listar comentarios de un jugador (publico)")
    public ResponseEntity<CommentListResponse> listByPlayer(@PathVariable String playerId) {
        return ResponseEntity.ok(commentService.listByPlayer(playerId));
    }

    @PostMapping("/player/{playerId}")
    @Operation(summary = "Anadir comentario a un jugador (publico)")
    @ApiResponse(responseCode = "201", description = "Comentario creado")
    @ApiResponse(responseCode = "404", description = "Jugador no encontrado")
    public ResponseEntity<?> create(@PathVariable String playerId,
                                     @Valid @RequestBody CommentCreateRequest request) {
        if (request.getAuthor() == null || request.getText() == null || request.getRating() == null) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("author, text y rating son obligatorios"));
        }
        if (request.getText().length() > 1000) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("El comentario no puede exceder 1000 caracteres"));
        }
        if (request.getRating() < 0 || request.getRating() > 5) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("La valoracion debe estar entre 0 y 5"));
        }

        try {
            CommentResponse response = commentService.create(playerId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("comment", response));
        } catch (CommentService.PlayerNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/count-by-player/{playerId}")
    @Operation(summary = "Obtener numero de comentarios de un jugador (usado via Feign)")
    public ResponseEntity<Map<String, Object>> countByPlayer(@PathVariable String playerId) {
        long count = commentService.countByPlayer(playerId);
        return ResponseEntity.ok(Map.of("playerId", playerId, "count", count));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar comentario (admin)")
    @ApiResponse(responseCode = "200", description = "Comentario eliminado")
    @ApiResponse(responseCode = "404", description = "No encontrado")
    public ResponseEntity<?> delete(@PathVariable String id) {
        jakarta.servlet.http.HttpServletRequest request =
            ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String role = (String) request.getAttribute("userRole");

        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(new ErrorResponse("No tienes permisos para esta accion"));
        }

        try {
            commentService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Comentario eliminado correctamente"));
        } catch (CommentService.CommentNotFoundException e) {
            return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage()));
        }
    }
}
