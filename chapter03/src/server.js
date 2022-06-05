import http from 'http'
import WebSocket from 'ws'
import express from "express";
import { SocketAddress } from 'net';

const app = express();

app.set('port', 3000);
app.set("view engine", "pug")
app.set('views', __dirname + '/views');

app.use('/public', express.static(__dirname + '/public'))

app.get('/', (req, res) => {
        req.app.render('home',{},(err, html) => {
            res.end(html)
        })
});
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => {
    console.log("Listening on http://localhost:" + app.get('port'));
}

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const sockets = [];

wss.on('connection', (socket) => {
    socket["nickname"] = "Anonymous";
    sockets.push(socket);
    console.log("Connected to Browser");
    socket.on('close', (socket) =>{
        console.log('Disconnected from Browser');
    });
    
    socket.on('message', (msg) => {
        let message = JSON.parse(msg);
        console.log(message.type + ": " + message.payload);
        switch(message.type) {
        case "new_message" :
            let senderNick = "";
            sockets.forEach((aSocket)=>{
                if(socket == aSocket){
                    senderNick = socket["nickname"];
                }
            });
            sockets.forEach((aSocket)=>{
                console.log(`${senderNick} : ${message.payload} `);
                aSocket.send( `${senderNick} : ${message.payload} `);
            });
            break;
        case "nickname" : 
            console.log('change nickname ...');
            socket["nickname"] = message.payload;
            // sockets.forEach((aSocket)=>{
            //     if(aSocket == socket) {
            //         aSocket["nickname"] = message.payload;
            //     }
            // });
        }
    });
});



server.listen(app.get('port'), handleListen);