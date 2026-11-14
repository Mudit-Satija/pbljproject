package com.clipsync.room;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RoomCodeGeneratorTest {

    private final RoomCodeGenerator generator = new RoomCodeGenerator();

    @Test
    void createsEightCharacterCodesWithoutAmbiguousCharacters() {
        for (int i = 0; i < 500; i++) {
            assertThat(generator.nextCode())
                    .hasSize(8)
                    .matches("[A-HJ-NP-Z2-9]{8}");
        }
    }

    @Test
    void producesUniqueCodes() {
        Set<String> codes = new HashSet<>();
        for (int i = 0; i < 1_000; i++) {
            codes.add(generator.nextCode());
        }

        assertThat(codes).hasSize(1_000);
    }
}
