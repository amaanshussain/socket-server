import express from 'express';
import http from 'http';
// import { Server } from "socket.io";
import WebSocket, { WebSocketServer } from "ws";

// server setup
const port = 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// host setup
let host_socket: WebSocket | null = null;
setInterval(() => {
    // send server status
    if (host_socket) {
        const clients = wss.clients;
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(["status", JSON.stringify({
                    type: "status",
                    message: `Connected clients: ${clients.size}`,
                    timestamp: new Date().toISOString()
                })].join("␟"));
            }
        })
    }
}, 1000)

app.use(express.static('public'));

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

wss.on("connection", (socket) => {
    console.log("A user connected.");
    if (!socket) {
        return;
    }
    socket.onmessage = (event) => {
        const data = String(event.data);
        if (data === "adminlogin") {
            host_socket = socket;
            console.log("Host socket set.");
            socket.send(["message", "Accepted as socket host."].join("␟"));
            return;
        }

        if (!host_socket) {
            console.log("Host socket not set, ignoring message.");
            return;
        }
        host_socket.send(["message", data].join("␟"));
        
        
    }

});
wss.on("disconnect", (socket) => console.log("A user disconnected:", socket.id));
