import express from 'express';
import http from 'http';
// import { Server } from "socket.io";
import { WebSocketServer } from "ws";

// server setup
const port = 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// host setup
let host_id = null;



app.use(express.static('public'));

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

wss.on("connection", (socket) => {
    console.log("A user connected:", socket);
    if (!socket) {
        return;
    }
    socket.on("auth", (data) => {
        console.log("Auth data received:", data);
    })

    socket.onmessage = (event) => {
        const data = String(event.data).split("␟");
        console.log("Message received:", data);
        socket.send(["auth", data[1]].join("␟"));

    }

});
wss.on("disconnect", (socket) => console.log("A user disconnected:", socket.id));
