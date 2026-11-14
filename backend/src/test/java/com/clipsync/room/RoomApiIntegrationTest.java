package com.clipsync.room;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RoomApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RoomService roomService;

    @Test
    void createsAnEmptyRoomWithAnEightCharacterCode() throws Exception {
        String response = mockMvc.perform(post("/api/rooms"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value(""))
                .andExpect(jsonPath("$.code").isString())
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.expiresAt").exists())
                .andExpect(jsonPath("$.revision").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String code = objectMapper.readTree(response).path("code").asText();
        assertThat(code)
                .hasSize(8)
                .matches("[A-HJ-NP-Z2-9]{8}");
    }

    @Test
    void savesAndReturnsClipboardContent() throws Exception {
        String code = createRoom();

        updateRoom(code, "hello from another device")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("hello from another device"))
                .andExpect(jsonPath("$.revision").value(1));

        mockMvc.perform(get("/api/rooms/{code}", code))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("hello from another device"));
    }

    @Test
    void acceptsLowercaseCodesInTheUrl() throws Exception {
        String code = createRoom();
        updateRoom(code, "case insensitive lookup");

        mockMvc.perform(get("/api/rooms/{code}", code.toLowerCase()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("case insensitive lookup"));
    }

    @Test
    void returnsNotFoundForUnknownRoom() throws Exception {
        mockMvc.perform(get("/api/rooms/{code}", "ZZZZZZZZ"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("That room was not found or has expired."));
    }

    @Test
    void rejectsContentOverTheSizeLimit() throws Exception {
        String code = createRoom();
        String oversized = "x".repeat(UpdateRoomRequest.MAX_CONTENT_LENGTH + 1);

        mockMvc.perform(put("/api/rooms/{code}", code)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", oversized))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Content can be at most " + UpdateRoomRequest.MAX_CONTENT_LENGTH + " characters."));
    }

    @Test
    void rejectsMissingContent() throws Exception {
        String code = createRoom();

        mockMvc.perform(put("/api/rooms/{code}", code)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Content is required."));
    }

    @Test
    void expiredRoomsCanNoLongerBeRead() throws Exception {
        String code = createRoom();
        expireRoom(code);

        mockMvc.perform(get("/api/rooms/{code}", code))
                .andExpect(status().isNotFound());
    }

    @Test
    void expiredRoomsCanNoLongerBeUpdated() throws Exception {
        String code = createRoom();
        expireRoom(code);

        updateRoom(code, "too late")
                .andExpect(status().isNotFound());
    }

    @Test
    void cleanupDeletesExpiredRooms() throws Exception {
        String expiredCode = createRoom();
        expireRoom(expiredCode);
        String activeCode = createRoom();

        roomService.purgeExpiredRooms();

        assertThat(roomCount(expiredCode)).isZero();
        assertThat(roomCount(activeCode)).isOne();
    }

    private String createRoom() throws Exception {
        String response = mockMvc.perform(post("/api/rooms"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode json = objectMapper.readTree(response);
        return json.path("code").asText();
    }

    private org.springframework.test.web.servlet.ResultActions updateRoom(String code, String content)
            throws Exception {
        return mockMvc.perform(put("/api/rooms/{code}", code)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("content", content))));
    }

    private void expireRoom(String code) {
        jdbcTemplate.update(
                "update rooms set expires_at = ? where code = ?",
                Timestamp.from(Instant.now().minusSeconds(60)),
                code);
    }

    private int roomCount(String code) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from rooms where code = ?", Integer.class, code);
        return count == null ? 0 : count;
    }
}
