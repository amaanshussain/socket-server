let socket;
let socketState = {
    clientCount: 0,
    socketIds: [],
    hostSocketId: null,
};

// SOCKET FUNCTIONS
function createConnection() {
    if (socket) {
        console.log("Socket already connected");
        return;
    }
    addMessage("info", "Creating connection...");
    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = function () {
        console.log("Socket connected");
        socket.send("adminlogin");
    }

    socket.onmessage = function (event) {
        const msg = event.data.split("␟");
        const svc = msg[0];
        const data = msg[1];

        if (svc === "status") {
            socketState = JSON.parse(data);
        }
        if (svc === "message") {
            addMessage("incoming", data);
        }
    }
}
function endConnection() {
    if (socket) {
        socket.close();
        socket = null;
        console.log("Socket disconnected");
        addMessage("info", "Closing connection.");
    } else {
        console.log("No active socket connection to disconnect");
    }
}
function sendMessage() {
    const msgInput = document.getElementById("msg");
    const message = msgInput.value;

    if (!socket || !getSocketState()) {
        console.log("No active socket connection to send message");
        return;
    }

    const selectedSocketId = document.getElementById("socket-select").value;
    if (selectedSocketId === "none") {
        console.log("No socket selected");
        return;
    }

    addMessage("outgoing", message);
    socket.send(["broadcast", selectedSocketId, message].join("␟"));
    msgInput.value = "";

}

function getSocketState() {
    return socket?.readyState === WebSocket.OPEN;
}

// DOCUMENT RENDER
function render() {
    setConnectionStatus();
    setConnectionsList();
}

function addMessage(type, msg) {
    const messagesElement = document.getElementById("messages");
    let cell = document.getElementById("initial-message").cloneNode(true);
    cell.innerHTML = msg;
    cell.classList = `socket-message socket-${type}`;
    messagesElement.appendChild(cell);
}

function setConnectionStatus() {
    const statusElement = document.getElementById("status");
    if (statusElement) {
        statusElement.textContent = getSocketState() ? "Connected" : "Disconnected";
    }
}

function setConnectionsList() {
    const selectElement = document.getElementById("socket-select");
    if (!selectElement) {
        console.error("Socket select element not found");
        return;
    }

    const selectedSocketId = selectElement.value;
    selectElement.innerHTML = ""; // Clear existing options

    // Create a default option
    const connected = getSocketState();
    if (!connected) {
        const option = document.createElement("option");
        option.value = "none";
        option.textContent = "Create a connection";
        selectElement.appendChild(option);
        return;
    }

    // Add all socket IDs except the host socket ID
    const socketIds = socketState.socketIds.filter(id => id !== socketState.hostSocketId);
    if (socketIds && socketIds.length > 0) {
        socketIds.forEach((id) => {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = id;
            selectElement.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.value = "none";
        option.textContent = "Waiting for connections...";
        selectElement.appendChild(option);
    }

    // If a socket is selected, set it as the value
    if (selectedSocketId && selectedSocketId !== "none") {
        selectElement.value = selectedSocketId;
    } else {
        // If no socket is selected, default to the first available socket ID
        if (socketIds.length > 0) {
            selectElement.value = socketIds[0];
        }
    }

}