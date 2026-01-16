import "dotenv/config";
import { createApp } from "./app.js";
import { memoryStore } from "./store/memoryStore.js";

const app = createApp();
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => console.log(`[backend] listening on http://localhost:${port}`));

// Check whether there are expired rooms once per 10 minutes -> Delete expired rooms
setInterval(() => {
    const removed = memoryStore.cleanupExpired();
    if (removed > 0) console.log(`[backend] cleanup removed ${removed} rooms`);
}, 10 * 60 * 1000);
