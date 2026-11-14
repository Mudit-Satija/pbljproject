package com.clipsync.room;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
public class RoomService {

    private static final Logger log = LoggerFactory.getLogger(RoomService.class);
    private static final int MAX_CODE_ATTEMPTS = 10;

    private final RoomRepository rooms;
    private final RoomCodeGenerator codeGenerator;
    private final Clock clock;
    private final Duration roomTtl;

    public RoomService(RoomRepository rooms,
                       RoomCodeGenerator codeGenerator,
                       Clock clock,
                       @Value("${clipsync.room-ttl:PT24H}") Duration roomTtl) {
        this.rooms = rooms;
        this.codeGenerator = codeGenerator;
        this.clock = clock;
        this.roomTtl = roomTtl;
    }

    @Transactional
    public Room createRoom() {
        Instant now = clock.instant();
        Room room = new Room(allocateCode(), now, now.plus(roomTtl));
        return rooms.save(room);
    }

    @Transactional(readOnly = true)
    public Room getActiveRoom(String code) {
        return findActiveRoom(code);
    }

    @Transactional
    public Room updateContent(String code, String content) {
        Room room = findActiveRoom(code);
        room.replaceContent(content, clock.instant());
        return room;
    }

    @Scheduled(fixedDelayString = "${clipsync.cleanup-interval:PT10M}",
               initialDelayString = "${clipsync.cleanup-initial-delay:PT5M}")
    @Transactional
    public void purgeExpiredRooms() {
        int removed = rooms.deleteExpiredBefore(clock.instant());
        if (removed > 0) {
            log.info("Purged {} expired room(s)", removed);
        }
    }

    private Room findActiveRoom(String code) {
        Room room = rooms.findByCode(normalize(code))
                .orElseThrow(RoomNotFoundException::new);

        if (room.isExpiredAt(clock.instant())) {
            throw new RoomNotFoundException();
        }
        return room;
    }

    private String allocateCode() {
        for (int attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
            String candidate = codeGenerator.nextCode();
            if (!rooms.existsByCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to allocate a unique room code");
    }

    private String normalize(String code) {
        return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
    }
}
