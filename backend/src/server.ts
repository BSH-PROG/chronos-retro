import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({ origin: true }));

app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    console.log(`[backend] listening on http://localhost:${port}`);
});
