package com.clipsync.room;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;

@Entity
@Table(name = "rooms", indexes = @Index(name = "idx_rooms_expires_at", columnList = "expires_at"))
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 8)
    private String code;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Version
    @Column(nullable = false)
    private long revision;

    protected Room() {
    }

    public Room(String code, Instant createdAt, Instant expiresAt) {
        this.code = code;
        this.content = "";
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public void replaceContent(String content, Instant now) {
        this.content = content;
        this.updatedAt = now;
    }

    public boolean isExpiredAt(Instant instant) {
        return !expiresAt.isAfter(instant);
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public long getRevision() {
        return revision;
    }
}
