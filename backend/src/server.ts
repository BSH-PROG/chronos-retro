import "dotenv/config";
import express from "express";
import cors from "cors";
import { roomsRouter } from "./routes/rooms.js";
import { memoryStore } from "./store/memoryStore.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: true }));

// api health check - delete someday
app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});

app.use("/api/rooms", roomsRouter);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    console.log(`[backend] listening on http://localhost:${port}`);
});

// Check whether there are expired rooms once per 10 minutes -> Delete expired rooms
setInterval(() => {
    const removed = memoryStore.cleanupExpired();
    if (removed > 0) console.log(`[backend] cleanup removed ${removed} rooms`);
}, 10 * 60 * 1000);
