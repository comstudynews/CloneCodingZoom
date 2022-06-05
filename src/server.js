import http from 'http';
import SocketIO from 'socket.io';
import express from "express";
import { SocketAddress } from 'net';

const app = express();

app.set('port', 3000);
app.set("view engine", "pug")
app.set('views', __dirname + '/views');

app.use('/public', express.static(__dirname + '/public'))

app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));


const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

//{"roomName": [{"socket id": socket, "socket id": socket}]}
const sockets = {}

wsServer.on('connection',(socket) => {
    socket.on('enter_room', (roomName, done) => {
        done();
        socket.join(roomName);
        socket.to(roomName).emit('welcome');
        socket.roomName = roomName;
        if(sockets[roomName] == undefined) {
            sockets[roomName] = [];
        }
        sockets[roomName].push(socket);
    });

    // socket.on('disconnect', () =>{    
    //     console.log('socket disconnected');
    //     let roomName = socket.roomName;
    //     if( sockets[roomName] != undefined ) {
    //             sockets[roomName].pop().to(roomName).emit('bye');
    //     }
    // });

    // 종료 이벤트 구분 주의 : disconnecting, disconnect
    socket.on('disconnecting', () => {
        socket.rooms.forEach((room => socket.to(room).emit('bye')))
    });

    socket.on('new_message', (msg, room, done) => {
        socket.to(room).emit('new_message', msg);
        done();
    });
});

const handleListen = ()=> console.log(`Listening on http://localhost:${app.get('port')}`);
httpServer.listen(app.get('port'), handleListen);