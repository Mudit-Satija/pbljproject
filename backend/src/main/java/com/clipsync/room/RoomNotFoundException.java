package com.clipsync.room;

public class RoomNotFoundException extends RuntimeException {

    public RoomNotFoundException() {
        super("That room was not found or has expired.");
    }
}
