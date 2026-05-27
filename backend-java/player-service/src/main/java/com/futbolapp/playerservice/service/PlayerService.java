package com.futbolapp.playerservice.service;

import com.futbolapp.playerservice.dto.PlayerCreateRequest;
import com.futbolapp.playerservice.dto.PlayerImportRequest;
import com.futbolapp.playerservice.dto.PlayerListResponse;
import com.futbolapp.playerservice.dto.PlayerResponse;
import com.futbolapp.playerservice.dto.PlayerUpdateRequest;
import com.futbolapp.playerservice.model.Player;
import com.futbolapp.playerservice.repository.PlayerRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final ApiFootballService apiFootballService;

    public PlayerService(PlayerRepository playerRepository, ApiFootballService apiFootballService) {
        this.playerRepository = playerRepository;
        this.apiFootballService = apiFootballService;
    }

    public PlayerListResponse list(String name, String team, String league,
                                    String createdBy, String createdFrom, String createdTo,
                                    int page, int limit) {
        LocalDateTime from = LocalDateTime.of(1900, 1, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(9999, 12, 31, 23, 59, 59);

        if (createdFrom != null && !createdFrom.isEmpty()) {
            from = LocalDateTime.parse(createdFrom, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
        if (createdTo != null && !createdTo.isEmpty()) {
            to = LocalDateTime.parse(createdTo, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }

        String nameLike = name != null ? "%" + name.toLowerCase() + "%" : "%";
        String teamLike = team != null ? "%" + team.toLowerCase() + "%" : "%";
        String leagueLike = league != null ? "%" + league.toLowerCase() + "%" : "%";

        Page<Player> pageResult = playerRepository.search(
            nameLike, teamLike, leagueLike, createdBy, from, to,
            PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        List<PlayerResponse> playerDtos = pageResult.getContent().stream()
            .map(PlayerResponse::new)
            .toList();

        return new PlayerListResponse(
            playerDtos,
            pageResult.getTotalElements(),
            page,
            pageResult.getTotalPages()
        );
    }

    public Player getById(String id) {
        return playerRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Jugador no encontrado"));
    }

    @CircuitBreaker(name = "apiFootball", fallbackMethod = "searchExternalFallback")
    public Map<String, Object> searchExternal(String name, String team, String league, int page) {
        return apiFootballService.searchPlayers(name, team, league, page);
    }

    public Map<String, Object> searchExternalFallback(String name, String team, String league, int page, Throwable t) {
        throw new ExternalApiException("Error al consultar la API externa de futbol (circuit breaker abierto)");
    }

    public static class ExternalApiException extends RuntimeException {
        public ExternalApiException(String message) { super(message); }
    }

    public Player importFromApi(PlayerImportRequest request, String firebaseUid) {
        if (playerRepository.existsByApiId(request.getPlayer().getId())) {
            throw new ConflictException("El jugador ya existe en la base de datos");
        }

        PlayerImportRequest.ApiPlayerData data = request.getPlayer();
        Player player = new Player();
        player.setSource(Player.Source.api);
        player.setApiId(data.getId());
        player.setName(data.getName());
        player.setFirstname(data.getFirstname());
        player.setLastname(data.getLastname());
        player.setNationality(data.getNationality());
        player.setHeight(data.getHeight());
        player.setWeight(data.getWeight());
        player.setPhoto(data.getPhoto());

        if (data.getBirth() != null) {
            player.setBirthDate(data.getBirth().getDate());
            player.setBirthPlace(data.getBirth().getPlace());
            player.setBirthCountry(data.getBirth().getCountry());
        }

        if (request.getStatistics() != null && request.getStatistics().length > 0) {
            if (request.getStatistics()[0] instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> stat = (Map<String, Object>) request.getStatistics()[0];
                @SuppressWarnings("unchecked")
                Map<String, Object> games = (Map<String, Object>) stat.get("games");
                if (games != null && games.get("position") != null) {
                    player.setPosition(games.get("position").toString());
                }
            }
        }

        player.setTeam(request.getTeam());
        if (request.getTeam() == null && request.getStatistics() != null && request.getStatistics().length > 0
            && request.getStatistics()[0] instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> stat = (Map<String, Object>) request.getStatistics()[0];
            @SuppressWarnings("unchecked")
            Map<String, Object> teamData = (Map<String, Object>) stat.get("team");
            if (teamData != null && teamData.get("name") != null) {
                player.setTeam(teamData.get("name").toString());
            }
        }

        player.setLeague(request.getLeague());
        if (request.getLeague() == null && request.getStatistics() != null && request.getStatistics().length > 0
            && request.getStatistics()[0] instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> stat = (Map<String, Object>) request.getStatistics()[0];
            @SuppressWarnings("unchecked")
            Map<String, Object> leagueData = (Map<String, Object>) stat.get("league");
            if (leagueData != null && leagueData.get("name") != null) {
                player.setLeague(leagueData.get("name").toString());
            }
        }

        if (request.getLocation() != null) {
            player.setLocationLat(request.getLocation().getLat());
            player.setLocationLng(request.getLocation().getLng());
            player.setLocationAddress(request.getLocation().getAddress());
        } else {
            player.setLocationLat(0.0);
            player.setLocationLng(0.0);
        }

        player.setCreatedBy(firebaseUid);
        return playerRepository.save(player);
    }

    public Player create(PlayerCreateRequest request, String firebaseUid) {
        Player player = new Player();
        player.setSource(Player.Source.manual);
        player.setName(request.getName());
        player.setFirstname(request.getFirstname());
        player.setLastname(request.getLastname());
        player.setNationality(request.getNationality());
        player.setPosition(request.getPosition());
        player.setBirthDate(request.getBirthDate());
        player.setHeight(request.getHeight());
        player.setWeight(request.getWeight());
        player.setPhoto(request.getPhoto());
        player.setTeam(request.getTeam());
        player.setLeague(request.getLeague());

        if (request.getLocation() != null) {
            player.setLocationLat(request.getLocation().getLat());
            player.setLocationLng(request.getLocation().getLng());
            player.setLocationAddress(request.getLocation().getAddress());
        } else {
            player.setLocationLat(0.0);
            player.setLocationLng(0.0);
        }

        player.setCreatedBy(firebaseUid);
        return playerRepository.save(player);
    }

    public Player update(String id, PlayerUpdateRequest request) {
        Player player = getById(id);

        if (request.getName() != null) player.setName(request.getName());
        if (request.getFirstname() != null) player.setFirstname(request.getFirstname());
        if (request.getLastname() != null) player.setLastname(request.getLastname());
        if (request.getNationality() != null) player.setNationality(request.getNationality());
        if (request.getPosition() != null) player.setPosition(request.getPosition());
        if (request.getBirthDate() != null) player.setBirthDate(request.getBirthDate());
        if (request.getHeight() != null) player.setHeight(request.getHeight());
        if (request.getWeight() != null) player.setWeight(request.getWeight());
        if (request.getPhoto() != null) player.setPhoto(request.getPhoto());
        if (request.getTeam() != null) player.setTeam(request.getTeam());
        if (request.getLeague() != null) player.setLeague(request.getLeague());
        if (request.getLocation() != null) {
            if (request.getLocation().getLat() != null) player.setLocationLat(request.getLocation().getLat());
            if (request.getLocation().getLng() != null) player.setLocationLng(request.getLocation().getLng());
            if (request.getLocation().getAddress() != null) player.setLocationAddress(request.getLocation().getAddress());
        }

        return playerRepository.save(player);
    }

    public boolean existsById(String id) {
        return playerRepository.existsById(id);
    }

    public void delete(String id) {
        if (!playerRepository.existsById(id)) {
            throw new NotFoundException("Jugador no encontrado");
        }
        playerRepository.deleteById(id);
    }

    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) { super(message); }
    }

    public static class ConflictException extends RuntimeException {
        public ConflictException(String message) { super(message); }
    }
}
