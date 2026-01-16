import express from "express";
import cors from "cors";
import { roomsRouter } from "./routes/rooms.js";

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use(cors({ origin: true }));
    app.use("/api/rooms", roomsRouter);

    return app;
}