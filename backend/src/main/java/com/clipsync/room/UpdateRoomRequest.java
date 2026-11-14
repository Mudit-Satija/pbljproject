package com.clipsync.room;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateRoomRequest(
        @NotNull(message = "Content is required.")
        @Size(max = MAX_CONTENT_LENGTH,
              message = "Content can be at most " + MAX_CONTENT_LENGTH + " characters.")
        String content) {

    public static final int MAX_CONTENT_LENGTH = 200_000;
}
