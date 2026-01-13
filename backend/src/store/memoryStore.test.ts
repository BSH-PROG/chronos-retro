import { describe, it, expect, beforeEach } from "vitest";
import { MemoryStore } from "./memoryStore.js";

describe("MemoryStore", () => {
    let store: MemoryStore;

    beforeEach(() => {
        store = new MemoryStore();
    });

    it("createRoom creates a room with default columns and TTL", () => {
        const room = store.createRoom();

        expect(room.votingEnabled).toBe(false);
        expect(room.items).toEqual([]);

        // 3 columns with expected keys
        const keys = room.columns.map((c) => c.key).sort();
        expect(keys).toEqual(["liked", "learned", "lacked"].sort());
    });

    it("getRoom returns null for not existing room", () => {
        expect(store.getRoom("does-not-exist")).toBeNull();
    });

    it("addItem adds trimmed item to correct column", () => {
        const room = store.createRoom();
        const updated = store.addItem(room.id, "liked", "  Many tests  ");

        expect(updated.items).toHaveLength(1);
        const item = updated.items[0];
        expect(item.text).toBe("Many tests");
        expect(item.votes).toBe(0);

        const likedColumn = updated.columns.find((c) => c.key === "liked")!;
        expect(item.columnId).toBe(likedColumn.id);
    });

    it("addItem rejects empty text and too long text", () => {
        const room = store.createRoom();

        expect(() => store.addItem(room.id, "liked", "   ")).toThrow("Text is empty");
        expect(() => store.addItem(room.id, "liked", "a".repeat(501))).toThrow(
            "Text too long"
        );
    });

    it("voteItem fails when voting is disabled, then works when enabled", () => {
        const room = store.createRoom();
        const r1 = store.addItem(room.id, "learned", "Many things");
        const itemId = r1.items[0].id;

        // Voting is disabled
        expect(() => store.voteItem(room.id, itemId)).toThrow("Voting is disabled");

        // Enable voting
        store.setVoting(room.id, true);

        const r2 = store.voteItem(room.id, itemId);
        expect(r2.items[0].votes).toBe(1);

        const r3 = store.voteItem(room.id, itemId);
        expect(r3.items[0].votes).toBe(2);
    });

    const pastDate = new Date("1999-01-01T00:00:00.000Z");

    it("getRoom deletes room after expiresAt", () => {
        const room = store.createRoom();
        // Make room expired
        room.expiresAt = pastDate.toISOString();

        // Room should be deleted
        expect(store.getRoom(room.id)).toBeNull();
    });

    it("cleanupExpired removes expired rooms", () => {
        const room1 = store.createRoom();
        // Make room1 expired
        room1.expiresAt = pastDate.toISOString();

        // Create a second new room
        const room2 = store.createRoom();

        // Run cleanupExpired()
        const removed = store.cleanupExpired();
        expect(removed).toBe(1);

        // Now room1 must be expired and room2 not
        expect(store.getRoom(room1.id)).toBeNull();
        expect(store.getRoom(room2.id)).not.toBeNull();
    });
});
