package com.futbolapp.commentservice.dto;

import java.util.List;

public class CommentListResponse {
    private List<CommentResponse> comments;

    public CommentListResponse(List<CommentResponse> comments) {
        this.comments = comments;
    }

    public List<CommentResponse> getComments() { return comments; }
}
