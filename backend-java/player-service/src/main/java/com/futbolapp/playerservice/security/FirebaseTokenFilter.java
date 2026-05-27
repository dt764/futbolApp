package com.futbolapp.playerservice.security;

import com.futbolapp.playerservice.model.User;
import com.futbolapp.playerservice.repository.UserRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenFilter.class);

    private final UserRepository userRepository;

    public FirebaseTokenFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);

            try {
                if (FirebaseApp.getApps().isEmpty()) {
                    log.warn("Firebase no inicializado, no se puede verificar token");
                    filterChain.doFilter(request, response);
                    return;
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

                request.setAttribute("userId", uid);
                request.setAttribute("userRole", user.getRole().name());
                request.setAttribute("user", user);
            } catch (Exception e) {
                response.setStatus(401);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token invalido o expirado\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
