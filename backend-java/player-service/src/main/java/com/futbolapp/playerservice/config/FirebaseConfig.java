package com.futbolapp.playerservice.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.service-account-base64:}")
    private String serviceAccountBase64;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().stream().anyMatch(app -> app.getName().equals(FirebaseApp.DEFAULT_APP_NAME))) {
            return FirebaseApp.getInstance();
        }

        if (serviceAccountBase64 == null || serviceAccountBase64.isEmpty()) {
            log.warn("Firebase no configurado — define firebase.service-account-base64 en application.yml");
            return null;
        }

        byte[] decoded = Base64.getDecoder().decode(serviceAccountBase64);
        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(new ByteArrayInputStream(decoded)))
            .build();

        return FirebaseApp.initializeApp(options);
    }
}
