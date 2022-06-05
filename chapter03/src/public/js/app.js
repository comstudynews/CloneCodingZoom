const messageList = document.querySelector("ul");
const nickForm = document.querySelector("form#nick");
const messageForm = document.querySelector("form#message");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', ()=>{
    console.log("Connection to Server");
});

socket.addEventListener('message', (message)=>{
    console.log("Server from message : ", message.data);
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.appendChild(li);
});

socket.addEventListener('close', ()=>{
    console.log("Disconnected from Server");
});

socket.addEventListener('error', (err)=>{
    console.log("socket error : ", err);
});

function mkMsg(type, payload) {
    return JSON.stringify({type, payload})
}

messageForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(mkMsg('new_message', input.value));
    input.value = '';
});

nickForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send( mkMsg('nickname', input.value) );
    input.value = '';
});