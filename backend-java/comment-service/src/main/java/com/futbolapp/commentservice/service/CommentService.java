package com.futbolapp.commentservice.service;

import com.futbolapp.commentservice.client.PlayerServiceClient;
import com.futbolapp.commentservice.dto.CommentCreateRequest;
import com.futbolapp.commentservice.dto.CommentListResponse;
import com.futbolapp.commentservice.dto.CommentResponse;
import com.futbolapp.commentservice.model.Comment;
import com.futbolapp.commentservice.repository.CommentRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PlayerServiceClient playerServiceClient;

    public CommentService(CommentRepository commentRepository, PlayerServiceClient playerServiceClient) {
        this.commentRepository = commentRepository;
        this.playerServiceClient = playerServiceClient;
    }

    public CommentListResponse listByPlayer(String playerId) {
        List<Comment> comments = commentRepository.findByPlayerIdOrderByCreatedAtDesc(playerId);
        List<CommentResponse> responseList = comments.stream()
            .map(c -> new CommentResponse(
                c.getId(), c.getPlayerId(), c.getAuthor(), c.getText(),
                c.getRating(), c.getLocationLat(), c.getLocationLng(), c.getCreatedAt()
            ))
            .toList();
        return new CommentListResponse(responseList);
    }

    @CircuitBreaker(name = "playerService", fallbackMethod = "createFallback")
    public CommentResponse create(String playerId, CommentCreateRequest request) {
        Map<String, Object> response = playerServiceClient.existsById(playerId);
        boolean exists = response != null && Boolean.TRUE.equals(response.get("exists"));
        if (!exists) {
            throw new PlayerNotFoundException("Jugador no encontrado");
        }

        Comment comment = new Comment();
        comment.setPlayerId(playerId);
        comment.setAuthor(request.getAuthor());
        comment.setText(request.getText());
        comment.setRating(request.getRating());

        if (request.getLocation() != null) {
            comment.setLocationLat(request.getLocation().getLat() != null ? request.getLocation().getLat() : 0.0);
            comment.setLocationLng(request.getLocation().getLng() != null ? request.getLocation().getLng() : 0.0);
        } else {
            comment.setLocationLat(0.0);
            comment.setLocationLng(0.0);
        }

        comment = commentRepository.save(comment);

        return new CommentResponse(
            comment.getId(), comment.getPlayerId(), comment.getAuthor(), comment.getText(),
            comment.getRating(), comment.getLocationLat(), comment.getLocationLng(), comment.getCreatedAt()
        );
    }

    public CommentResponse createFallback(String playerId, CommentCreateRequest request, Throwable t) {
        throw new PlayerNotFoundException(
            "No se pudo verificar el jugador (circuit breaker abierto). Intente de nuevo mas tarde."
        );
    }

    public long countByPlayer(String playerId) {
        return commentRepository.countByPlayerId(playerId);
    }

    public void delete(String id) {
        if (!commentRepository.existsById(id)) {
            throw new CommentNotFoundException("Comentario no encontrado");
        }
        commentRepository.deleteById(id);
    }

    public static class CommentNotFoundException extends RuntimeException {
        public CommentNotFoundException(String message) { super(message); }
    }

    public static class PlayerNotFoundException extends RuntimeException {
        public PlayerNotFoundException(String message) { super(message); }
    }
}
