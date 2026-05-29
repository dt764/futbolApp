package com.futbolapp.commentservice.repository;

import com.futbolapp.commentservice.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByPlayerIdOrderByCreatedAtDesc(String playerId);
    long countByPlayerId(String playerId);
}
