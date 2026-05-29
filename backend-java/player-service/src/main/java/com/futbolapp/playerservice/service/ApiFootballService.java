package com.futbolapp.playerservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class ApiFootballService {

    private static final String API_URL = "https://v3.football.api-sports.io";

    @Value("${api-football.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public ApiFootballService() {
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> searchPlayers(String name, String team, String league, int page) {
        Object teamId = team != null && !team.isEmpty() ? resolveToId(team, "team") : null;
        Object leagueId = league != null && !league.isEmpty() ? resolveToId(league, "league") : null;

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(API_URL + "/players")
            .queryParam("page", page);

        if (name != null && !name.isEmpty()) builder.queryParam("search", name);
        if (teamId != null) builder.queryParam("team", teamId);
        if (leagueId != null) builder.queryParam("league", leagueId);

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        ResponseEntity<Map> response = restTemplate.exchange(
            builder.toUriString(), HttpMethod.GET, entity, Map.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new ExternalApiException("Error al consultar la API externa de futbol");
        }

        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    private Object resolveToId(String name, String type) {
        if (name.matches("\\d+")) return name;

        String endpoint = type.equals("team") ? "/teams" : "/leagues";
        String url = UriComponentsBuilder.fromHttpUrl(API_URL + endpoint)
            .queryParam("search", name)
            .toUriString();

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

        if (response.getBody() != null) {
            var responseArr = (List<Map<String, Object>>) response.getBody().get("response");
            if (responseArr != null && !responseArr.isEmpty()) {
                Map<String, Object> item = responseArr.get(0);
                if (type.equals("team")) {
                    Map<String, Object> teamData = (Map<String, Object>) item.get("team");
                    return teamData.get("id");
                } else {
                    Map<String, Object> leagueData = (Map<String, Object>) item.get("league");
                    return leagueData.get("id");
                }
            }
        }

        throw new ExternalApiException("No se encontro el " + type + " \"" + name + "\" en API-Football");
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-apisports-key", apiKey);
        return headers;
    }

    public static class ExternalApiException extends RuntimeException {
        public ExternalApiException(String message) { super(message); }
    }
}
