package com.futbolapp.playerservice.controller;

import com.futbolapp.playerservice.dto.*;
import com.futbolapp.playerservice.model.User;
import com.futbolapp.playerservice.service.FirebaseAuthService;
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
@RequestMapping("/api/auth")
@Tag(name = "Autenticacion", description = "Gestion de autenticacion")
public class AuthController {

    private final FirebaseAuthService authService;

    public AuthController(FirebaseAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesion")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (FirebaseAuthService.AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<?> register(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.register(
                request.getEmail(), request.getPassword(), request.getEmail()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (FirebaseAuthService.AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener usuario actual")
    public ResponseEntity<?> me() {
        User user = (User) getRequest().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }
        return ResponseEntity.ok(Map.of("user", authService.getMe(user)));
    }

    @PutMapping("/me")
    @Operation(summary = "Actualizar usuario actual")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, String> body) {
        User user = (User) getRequest().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }
        try {
            User updated = authService.updateMe(user, body.get("displayName"));
            return ResponseEntity.ok(Map.of("user", authService.getMe(updated)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private jakarta.servlet.http.HttpServletRequest getRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    }
}
