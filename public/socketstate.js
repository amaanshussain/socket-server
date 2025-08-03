let socket;
// createConnection();

// SOCKET FUNCTIONS
function createConnection() {
    if (socket) {
        console.log("Socket already connected");
        return;
    }
    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = function () {
        console.log("Socket connected");
        socket.send("adminlogin");
    }

    socket.onmessage = function (event) {
        const msg = event.data.split("␟");
        const svc = msg[0];

        if (svc === "status") {

        }
        if (svc === "message") {
            addMessage(msg[1]);
        }
    }
}
function endConnection() {
    if (socket) {
        socket.close();
        socket = null;
        console.log("Socket disconnected");
        addMessage("Closing connection.");
    } else {
        console.log("No active socket connection to disconnect");
    }
}
function sendMessage() {
    const msgInput = document.getElementById("msg");
    const message = msgInput.value;
    if (socket && getSocketState()) {
        socket.send(message);
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

function addMessage(msg) {
    const messagesElement = document.getElementById("messages");
    let cell = document.getElementById("initial-message").cloneNode(true);
    cell.innerHTML = msg;
    messagesElement.appendChild(cell);
}