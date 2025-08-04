import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from "ws";

interface CustomWebSocket extends WebSocket {
    socketId?: string;
}

// server setup
const port = 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// host setup
let host_socket: CustomWebSocket | null = null;

// socket state
interface SocketState {
    clientCount: number;
    socketIds: string[];
    hostSocketId: string | null;
}
setInterval(() => {
    // send server status
    if (host_socket) {
        const clients = wss.clients;
        
        const state: SocketState = {
            clientCount: clients.size,
            socketIds: Array.from(clients).map(client => (client as CustomWebSocket).socketId || "unknown"),
            hostSocketId: host_socket.socketId || null,
        };
        host_socket.send(["status", host_socket.socketId, JSON.stringify(state)].join("␟"));
    }
}, 250)

app.use(express.static('public'));

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

wss.on("connection", (socket: CustomWebSocket) => {
    const uid = crypto.randomUUID();
    socket.socketId = uid;
    console.log("A user connected,", socket.socketId);
    if (!socket) {
        return;
    }
    socket.send(`Welcome to the socket server! Your socket ID is ${uid}`);
    socket.onmessage = (event) => {
        const data = String(event.data);
        console.log("Received message:", data);

        // handle admin login
        if (data === "adminlogin") {
            host_socket = socket;
            console.log("Host socket set.");
            return;
        }

        // handle message broadcast
        if (data.startsWith("broadcast")) {

            const [_, targetClient, message] = data.split("␟");
            wss.clients.forEach((client: CustomWebSocket) => {
                if (client.readyState === WebSocket.OPEN && client.socketId === targetClient) {
                    if (message) {
                        client.send(message);
                    }
                }
            });
            return;
        }

        // forward message to host if it exists
        if (!host_socket) {
            console.log("Host socket not set, ignoring message.");
            return;
        }
        host_socket.send(["message", socket.socketId, data].join("␟"));
    }

});
wss.on("disconnect", (socket: CustomWebSocket) => console.log("A user disconnected:", socket.socketId));
