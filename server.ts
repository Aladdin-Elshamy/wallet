import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = 3000;
function generateTransactionStream(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const amount = (Math.random() * 400 + 10).toFixed(2);
    const refSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const reference = `${date}${refSuffix}`;

    const sampleNotes = [
        "debt payment march",
        "monthly subscription",
        "invoice settlement",
        "salary disbursement",
        "cloud hosting fee",
        "vendor payout",
    ];
    const randomNote = sampleNotes[Math.floor(Math.random() * sampleNotes.length)];
    const internalRef = "A" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const metadata = `note:${randomNote};internal_reference:${internalRef}`;

    // Format: Date|Amount|Reference|Key:Value pairs separated by ;
    return `${date}|${amount}|${reference}|${metadata}`;
}

app.prepare().then(() => {
    const httpServer = createServer((req, res) => handle(req, res));
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Stream non-stop data every 1 second
        const streamInterval = setInterval(() => {
            const feedData = generateTransactionStream();
            socket.emit("message", feedData);
        }, 1000);

        socket.on("message", (data) => {
            console.log("Message received:", data);
            io.emit("message", data); // Broadcast to all clients
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
            clearInterval(streamInterval);
        });
    });
   httpServer.listen(port, () => {
       console.log(`> Ready on http://localhost:${port}`);
   });
});