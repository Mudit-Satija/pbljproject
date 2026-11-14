package com.clipsync.room;

import java.time.Instant;

public record RoomResponse(
        String code,
        String content,
        Instant createdAt,
        Instant updatedAt,
        Instant expiresAt,
        long revision) {

    public static RoomResponse from(Room room) {
        return new RoomResponse(
                room.getCode(),
                room.getContent(),
                room.getCreatedAt(),
                room.getUpdatedAt(),
                room.getExpiresAt(),
                room.getRevision());
    }
}
