import { Router } from "express";
import { memoryStore } from "../store/memoryStore.js";
import type { ColumnKey } from "../domain/types.js";

export const roomsRouter = Router();

// POST /api/rooms/ -> create room
roomsRouter.post("/", (_req, res) => {
    const room = memoryStore.createRoom();
    res.status(201).json({ roomId: room.id });
});

// GET /api/rooms/:roomId -> get room object
roomsRouter.get("/:roomId", (req, res) => {
    const room = memoryStore.getRoom(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
});

// POST /api/rooms/:roomId/items -> add item
roomsRouter.post("/:roomId/items", (req, res) => {
    const { columnKey, text } = req.body as { columnKey?: ColumnKey; text?: string };

    if (!columnKey) return res.status(400).json({ error: "columnKey is required" });
    if (typeof text !== "string") return res.status(400).json({ error: "text is required" });

    try {
        const room = memoryStore.addItem(req.params.roomId, columnKey, text);
        res.json(room);
    } catch (e) {
        res.status(400).json({ error: (e as Error).message });
    }
});

// POST /api/rooms/:roomId/voting -> enable/disable voting
roomsRouter.post("/:roomId/voting", (req, res) => {
    const { enabled } = req.body as { enabled?: boolean };
    if (typeof enabled !== "boolean") return res.status(400).json({ error: "enabled must be boolean" });

    try {
        const room = memoryStore.setVoting(req.params.roomId, enabled);
        res.json(room);
    } catch (e) {
        res.status(400).json({ error: (e as Error).message });
    }
});

// POST /api/rooms/:roomId/items/:itemId/vote -> +1 vote
roomsRouter.post("/:roomId/items/:itemId/vote", (req, res) => {
    try {
        const room = memoryStore.voteItem(req.params.roomId, req.params.itemId);
        res.json(room);
    } catch (e) {
        res.status(400).json({ error: (e as Error).message });
    }
});
