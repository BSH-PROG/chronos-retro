import { randomUUID } from "node:crypto";
import type {Column, ColumnKey, RoomState} from "../domain/types.js";

export const TTL_MS = 24 * 60 * 60 * 1000; // One day in ms

function nowIso() {
    return new Date().toISOString();
}

function expiresIso() {
    return new Date(Date.now() + TTL_MS).toISOString();
}

function defaultColumns(): Column[] {
    return [
        { id: randomUUID(), key: "liked", title: "Liked", order: 1 },
        { id: randomUUID(), key: "learned", title: "Learned", order: 2 },
        { id: randomUUID(), key: "lacked", title: "Lacked", order: 3 }
    ];
}

export class MemoryStore {
    private rooms = new Map<string, RoomState>();

    createRoom(): RoomState {
        const id = randomUUID();
        const room: RoomState = {
            id: id,
            createdAt: nowIso(),
            expiresAt: expiresIso(),
            votingEnabled: false,
            columns: defaultColumns(),
            items: []
        };
        this.rooms.set(id, room);
        return room;
    }

    getRoom(roomId: string): RoomState | null {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        // If expired -> delete room
        if (new Date(room.expiresAt).getTime() < Date.now()) {
            this.rooms.delete(roomId);
            return null;
        }
        return room;
    }

    addItem(roomId: string, columnKey: ColumnKey, text: string): RoomState {
        const room = this.mustGet(roomId);

        const column = room.columns.find((c) => c.key === columnKey);
        if (!column) throw new Error("Unknown columnKey");

        const trimmedText = text.trim();
        if (!trimmedText) throw new Error("Text is empty");
        if (trimmedText.length > 500) throw new Error("Text too long (max 500)");

        room.items.push({
            id: randomUUID(),
            columnId: column.id,
            text: trimmedText,
            votes: 0,
            createdAt: nowIso()
        });

        return room;
    }

    setVoting(roomId: string, enabled: boolean): RoomState {
        const room = this.mustGet(roomId);
        room.votingEnabled = enabled;
        return room;
    }

    voteItem(roomId: string, itemId: string): RoomState {
        const room = this.mustGet(roomId);
        if (!room.votingEnabled) throw new Error("Voting is disabled");

        const item = room.items.find((i) => i.id === itemId);
        if (!item) throw new Error("Item not found");

        item.votes += 1;
        return room;
    }

    cleanupExpired(): number {
        let removed = 0;
        const now = Date.now();
        for (const [id, room] of this.rooms.entries()) {
            if (new Date(room.expiresAt).getTime() < now) {
                this.rooms.delete(id);
                removed += 1;
            }
        }
        return removed;
    }

    private mustGet(roomId: string): RoomState {
        const room = this.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        return room;
    }
}

export const memoryStore = new MemoryStore();
