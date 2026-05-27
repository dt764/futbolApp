package com.futbolapp.playerservice.service;

import com.futbolapp.playerservice.dto.AuthResponse;
import com.futbolapp.playerservice.dto.LoginRequest;
import com.futbolapp.playerservice.model.User;
import com.futbolapp.playerservice.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class FirebaseAuthService {

    private final UserRepository userRepository;

    @Value("${firebase.api-key:}")
    private String firebaseApiKey;

    public FirebaseAuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse login(LoginRequest request) {
        try {
            String idToken = request.getIdToken();

            if (idToken == null || idToken.isEmpty()) {
                if (request.getEmail() == null || request.getPassword() == null) {
                    throw new IllegalArgumentException("Requiere idToken o email+password");
                }
                idToken = signInWithEmailPassword(request.getEmail(), request.getPassword());
            }

            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            User user = userRepository.findByUid(uid).orElseGet(() -> {
                User newUser = new User();
                newUser.setUid(uid);
                newUser.setEmail(decodedToken.getEmail() != null ? decodedToken.getEmail() : "");
                newUser.setDisplayName(
                    decodedToken.getName() != null ? decodedToken.getName() :
                    decodedToken.getEmail() != null ? decodedToken.getEmail() : ""
                );
                return userRepository.save(newUser);
            });

            return new AuthResponse(idToken, new AuthResponse.UserInfo(
                user.getUid(), user.getEmail(), user.getDisplayName(), user.getRole().name()
            ));
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("Credenciales invalidas");
        }
    }

    public AuthResponse.UserInfo getMe(User user) {
        return new AuthResponse.UserInfo(
            user.getUid(), user.getEmail(), user.getDisplayName(), user.getRole().name()
        );
    }

    public User updateMe(User user, String newDisplayName) {
        if (newDisplayName == null || newDisplayName.trim().isEmpty()) {
            throw new IllegalArgumentException("displayName es requerido");
        }
        user.setDisplayName(newDisplayName.trim());
        return userRepository.save(user);
    }

    private String signInWithEmailPassword(String email, String password) {
        if (firebaseApiKey == null || firebaseApiKey.isEmpty()) {
            throw new IllegalArgumentException("FIREBASE_API_KEY no configurada");
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + firebaseApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
            Map.of("email", email, "password", password, "returnSecureToken", true), headers
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new AuthException("Error al autenticar con Firebase");
        }

        return (String) response.getBody().get("idToken");
    }

    public static class AuthException extends RuntimeException {
        public AuthException(String message) { super(message); }
    }
}
