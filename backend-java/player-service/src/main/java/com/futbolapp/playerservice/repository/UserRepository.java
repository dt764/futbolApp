package com.futbolapp.playerservice.repository;

import com.futbolapp.playerservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUid(String uid);
    Optional<User> findByEmail(String email);
    boolean existsByUid(String uid);
}
