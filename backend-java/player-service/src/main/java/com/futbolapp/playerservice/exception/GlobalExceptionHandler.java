package com.futbolapp.playerservice.exception;

import com.futbolapp.playerservice.dto.ErrorResponse;
import com.futbolapp.playerservice.service.FirebaseAuthService;
import com.futbolapp.playerservice.service.PlayerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PlayerService.NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(PlayerService.NotFoundException e) {
        return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(PlayerService.ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(PlayerService.ConflictException e) {
        return ResponseEntity.status(409).body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(FirebaseAuthService.AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuth(FirebaseAuthService.AuthException e) {
        return ResponseEntity.status(401).body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(PlayerService.ExternalApiException.class)
    public ResponseEntity<ErrorResponse> handleExternalApi(PlayerService.ExternalApiException e) {
        return ResponseEntity.status(502).body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(err ->
            errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new ErrorResponse("Datos invalidos", errors));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        return ResponseEntity.status(500).body(new ErrorResponse("Error interno del servidor"));
    }
}
