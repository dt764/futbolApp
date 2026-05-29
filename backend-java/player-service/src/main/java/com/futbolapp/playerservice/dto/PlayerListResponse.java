package com.futbolapp.playerservice.dto;

import java.util.List;

public class PlayerListResponse {
    private List<PlayerResponse> players;
    private long total;
    private int page;
    private int pages;

    public PlayerListResponse(List<PlayerResponse> players, long total, int page, int pages) {
        this.players = players;
        this.total = total;
        this.page = page;
        this.pages = pages;
    }

    public List<PlayerResponse> getPlayers() { return players; }
    public long getTotal() { return total; }
    public int getPage() { return page; }
    public int getPages() { return pages; }
}
