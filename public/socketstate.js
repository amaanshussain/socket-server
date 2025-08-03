let socket;
// let socket = io(window.location.origin);

// SOCKET FUNCTIONS
function createConnection() {
    if (socket) {
        console.log("Socket already connected");
        return;
    }
    // socket = io(window.location.origin);
    socket = new WebSocket("ws://localhost:3000");
    socket.onmessage = function(event) {
        const msg = event.data.split("␟");
        const messagesElement = document.getElementById("messages");
        if (msg[0] === "auth") {
            const li = document.createElement("li");
            li.textContent = `Auth: ${msg[1]}`;
            messagesElement.appendChild(li);
        }
    }
}
function endConnection() {
    if (socket) {
        socket.close();
        socket = null;
        console.log("Socket disconnected");
    } else {
        console.log("No active socket connection to disconnect");
    }
}
function sendMessage() {
    const msgInput = document.getElementById("msg");
    const message = msgInput.value;
    if (socket && getSocketState()) {
        socket.send(["auth", message].join("␟"));
        msgInput.value = "";
    } else {
        console.log("Socket is not connected");
    }
}

function getSocketState() {
    return socket?.readyState === WebSocket.OPEN;
}

// SOCKET EVENT LISTENERS
function render() {
    const statusElement = document.getElementById("status");
    if (statusElement) {
        statusElement.textContent = getSocketState() ? "Connected" : "Disconnected";
    }
}

