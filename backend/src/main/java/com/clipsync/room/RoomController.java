package com.clipsync.room;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse createRoom() {
        return RoomResponse.from(roomService.createRoom());
    }

    @GetMapping("/{code}")
    public RoomResponse getRoom(@PathVariable String code) {
        return RoomResponse.from(roomService.getActiveRoom(code));
    }

    @PutMapping("/{code}")
    public RoomResponse updateRoom(@PathVariable String code,
                                   @Valid @RequestBody UpdateRoomRequest request) {
        return RoomResponse.from(roomService.updateContent(code, request.content()));
    }
}
