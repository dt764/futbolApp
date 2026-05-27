package com.futbolapp.playerservice.repository;

import com.futbolapp.playerservice.model.Player;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, String> {

    Optional<Player> findByApiId(Long apiId);

    boolean existsByApiId(Long apiId);

    @Query("SELECT p FROM Player p WHERE " +
           "LOWER(p.name) LIKE :name AND " +
           "LOWER(p.team) LIKE :team AND " +
           "LOWER(p.league) LIKE :league AND " +
           "(:createdBy IS NULL OR p.createdBy = :createdBy) AND " +
           "p.createdAt >= :createdFrom AND " +
           "p.createdAt <= :createdTo")
    Page<Player> search(@Param("name") String name,
                        @Param("team") String team,
                        @Param("league") String league,
                        @Param("createdBy") String createdBy,
                        @Param("createdFrom") LocalDateTime createdFrom,
                        @Param("createdTo") LocalDateTime createdTo,
                        Pageable pageable);
}
