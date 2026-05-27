package com.futbolapp.playerservice.service;

import com.futbolapp.playerservice.dto.IdealTeamResponse;
import com.futbolapp.playerservice.model.Player;
import com.futbolapp.playerservice.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    @Value("${groq.api-key:}")
    private String groqApiKey;

    private final PlayerRepository playerRepository;
    private final RestTemplate restTemplate;

    public GroqService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
        this.restTemplate = new RestTemplate();
    }

    private static final List<Map<String, String>> FANTASY_PLAYERS = List.of(
        Map.of("name", "Lionel Messi", "position", "Delantero", "team", "Inter Miami", "league", "MLS", "nationality", "Argentina", "height", "170", "weight", "72"),
        Map.of("name", "Cristiano Ronaldo", "position", "Delantero", "team", "Al-Nassr", "league", "Saudi League", "nationality", "Portugal", "height", "187", "weight", "85"),
        Map.of("name", "Kylian Mbappe", "position", "Delantero", "team", "Real Madrid", "league", "La Liga", "nationality", "Francia", "height", "178", "weight", "73"),
        Map.of("name", "Erling Haaland", "position", "Delantero", "team", "Manchester City", "league", "Premier League", "nationality", "Noruega", "height", "194", "weight", "88"),
        Map.of("name", "Kevin De Bruyne", "position", "Centrocampista", "team", "Manchester City", "league", "Premier League", "nationality", "Belgica", "height", "181", "weight", "76"),
        Map.of("name", "Jude Bellingham", "position", "Centrocampista", "team", "Real Madrid", "league", "La Liga", "nationality", "Inglaterra", "height", "186", "weight", "75"),
        Map.of("name", "Rodri", "position", "Centrocampista", "team", "Manchester City", "league", "Premier League", "nationality", "Espana", "height", "191", "weight", "82"),
        Map.of("name", "Virgil van Dijk", "position", "Defensa", "team", "Liverpool", "league", "Premier League", "nationality", "Paises Bajos", "height", "193", "weight", "92"),
        Map.of("name", "Ruben Dias", "position", "Defensa", "team", "Manchester City", "league", "Premier League", "nationality", "Portugal", "height", "187", "weight", "84"),
        Map.of("name", "Theo Hernandez", "position", "Defensa", "team", "AC Milan", "league", "Serie A", "nationality", "Francia", "height", "181", "weight", "77"),
        Map.of("name", "Achraf Hakimi", "position", "Defensa", "team", "PSG", "league", "Ligue 1", "nationality", "Marruecos", "height", "181", "weight", "73"),
        Map.of("name", "Thibaut Courtois", "position", "Portero", "team", "Real Madrid", "league", "La Liga", "nationality", "Belgica", "height", "200", "weight", "96"),
        Map.of("name", "Vinicius Jr", "position", "Delantero", "team", "Real Madrid", "league", "La Liga", "nationality", "Brasil", "height", "176", "weight", "73"),
        Map.of("name", "Mohamed Salah", "position", "Delantero", "team", "Liverpool", "league", "Premier League", "nationality", "Egipto", "height", "175", "weight", "71"),
        Map.of("name", "Lamine Yamal", "position", "Delantero", "team", "FC Barcelona", "league", "La Liga", "nationality", "Espana", "height", "180", "weight", "72")
    );

    @SuppressWarnings("unchecked")
    public IdealTeamResponse generateIdealTeam(String formation, String source) {
        List<Map<String, String>> players;

        if ("fantasy".equals(source)) {
            players = FANTASY_PLAYERS;
        } else {
            List<Player> dbPlayers = playerRepository.findAll()
                .stream().filter(p -> p.getSource() == Player.Source.api).toList();

            if (dbPlayers.size() < 11) {
                throw new IllegalArgumentException(
                    "Se necesitan al menos 11 jugadores importados de la API. Actualmente hay " + dbPlayers.size() + ".");
            }

            players = dbPlayers.stream().map(p -> Map.<String, String>of(
                "name", p.getName() != null ? p.getName() : "",
                "position", p.getPosition() != null ? p.getPosition() : "desconocida",
                "team", p.getTeam() != null ? p.getTeam() : "",
                "league", p.getLeague() != null ? p.getLeague() : "",
                "nationality", p.getNationality() != null ? p.getNationality() : "",
                "height", p.getHeight() != null ? p.getHeight() : "",
                "weight", p.getWeight() != null ? p.getWeight() : ""
            )).toList();
        }

        try {
            Map<String, Object> groqResponse = callGroqApi(players, formation);

            List<Map<String, String>> startingXI = (List<Map<String, String>>) groqResponse.get("startingXI");
            List<Map<String, String>> substitutes = (List<Map<String, String>>) groqResponse.get("substitutes");
            String responseFormation = (String) groqResponse.getOrDefault("formation", formation != null ? formation : "4-3-3");
            String summary = (String) groqResponse.getOrDefault("summary", "");

            Map<String, Map<String, String>> lookup = new java.util.HashMap<>();
            for (Map<String, String> p : players) {
                lookup.put(p.get("name").toLowerCase(), p);
            }

            List<IdealTeamResponse.PlayerInfo> teamPlayers = new ArrayList<>();

            if (startingXI != null) {
                for (Map<String, String> p : startingXI) {
                    teamPlayers.add(enrichPlayer(p, lookup));
                }
            }
            if (substitutes != null) {
                for (Map<String, String> p : substitutes) {
                    teamPlayers.add(enrichPlayer(p, lookup));
                }
            }

            return new IdealTeamResponse(
                new IdealTeamResponse.TeamInfo(responseFormation, teamPlayers, summary),
                source
            );
        } catch (Exception e) {
            throw new GroqApiException("Error al contactar con Groq: " + e.getMessage());
        }
    }

    private IdealTeamResponse.PlayerInfo enrichPlayer(Map<String, String> player, Map<String, Map<String, String>> lookup) {
        String name = player.getOrDefault("name", "");
        String position = player.getOrDefault("position", "");
        Map<String, String> found = lookup.get(name.toLowerCase());
        return new IdealTeamResponse.PlayerInfo(
            name,
            position,
            found != null ? found.getOrDefault("team", "") : "",
            found != null ? found.getOrDefault("league", "") : "",
            found != null ? found.getOrDefault("nationality", "") : ""
        );
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callGroqApi(List<Map<String, String>> players, String formation) {
        String formationInstruction = formation != null
            ? "Formación: " + formation
            : "Elige la mejor formación según los jugadores disponibles.";

        String playersJson = players.stream()
            .map(p -> {
                StringBuilder sb = new StringBuilder("{");
                p.forEach((k, v) -> sb.append("\"").append(k).append("\":\"").append(v != null ? v : "").append("\","));
                if (sb.charAt(sb.length() - 1) == ',') sb.deleteCharAt(sb.length() - 1);
                sb.append("}");
                return sb.toString();
            })
            .reduce((a, b) -> a + ",\n" + b)
            .orElse("[]");

        String systemPrompt = "Eres un entrenador de fútbol experto. Dada una lista de jugadores disponibles, " +
            "selecciona el mejor equipo ideal posible. Responde SOLO con JSON válido.";
        String userPrompt = "Jugadores disponibles: [" + playersJson + "]\n" + formationInstruction +
            "\n\nResponde con JSON en este formato exacto:\n" +
            "{\"formation\": \"formación\", \"startingXI\": [{\"name\": \"...\", \"position\": \"...\", \"reason\": \"...\"}], " +
            "\"substitutes\": [{\"name\": \"...\", \"position\": \"...\", \"reason\": \"...\"}], \"summary\": \"...\"}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
            "model", "llama-3.3-70b-versatile",
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
            "https://api.groq.com/openai/v1/chat/completions",
            entity,
            Map.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new GroqApiException("Error al contactar con Groq");
        }

        Map<String, Object> body = response.getBody();
        var choices = (List<Map<String, Object>>) body.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new GroqApiException("Respuesta vacia de Groq");
        }

        String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

        // Parse the JSON from the response
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(content, Map.class);
        } catch (Exception e) {
            throw new GroqApiException("Error al parsear respuesta de Groq: " + e.getMessage());
        }
    }

    public static class GroqApiException extends RuntimeException {
        public GroqApiException(String message) { super(message); }
    }
}
