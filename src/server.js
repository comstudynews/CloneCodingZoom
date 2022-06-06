import http from 'http';
//import SocketIO from 'socket.io';
import {Server} from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
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
//const wsServer = SocketIO(httpServer);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ['https://admin.socket.io'],
        credentials : true
    }
});

instrument(wsServer, {
    auth: false
})

function publicRooms() {
    // const sids = wsServer.sockets.adapter.sids;
    // const rooms = wsServer.sockets.adapter.rooms;
    const {
        sockets: {
            adapter : {sids, rooms},
        },
    } = wsServer;

    const pbrRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined) {
            pbrRooms.push(key);
        }
    });
    return pbrRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

//{"roomName": [{"socket id": socket, "socket id": socket}]}
const sockets = {}

wsServer.on('connection',(socket) => {
    console.log("server connection established >>> ", socket.id);
    socket['nickname'] = 'Anonymous';
    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter);
        console.log(`Socket Event: ${event}`)
    });
    wsServer.sockets.emit("room_change", publicRooms());
    socket.on('enter_room', (roomName, done) => {
        done();
        socket.join(roomName);
        socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
        
        // 'disconnect' 테스트를 위해 내가 임으로 추가한 코드
        // socket.roomName = roomName;
        // if(sockets[roomName] == undefined) {
        //     sockets[roomName] = [];
        // }
        // sockets[roomName].push(socket);
    });

    // socket.on('disconnect', () =>{    
    //     console.log('socket disconnected');
    //     let roomName = socket.roomName;
    //     if( sockets[roomName] != undefined ) {
    //             sockets[roomName].pop().to(roomName).emit('bye');
    //     }
    // });

    // 종료 이벤트 구분 주의 : disconnecting, disconnect
    socket.on('disconnect', () =>{
        wsServer.sockets.emit("room_change", publicRooms());
    })

    socket.on('disconnecting', () => {
        socket.rooms.forEach((room) => {
            socket.to(room).emit('bye', socket.nickname, countRoom(room) -1);
        });
    });

    socket.on('new_message', (msg, room, done) => {
        socket.to(room).emit('new_message', `${socket.nickname}:${msg}`);
        done();
    });

    socket.on('nickname', (roomName, nickname)=> {
        console.log(nickname);
        (socket['nickname'] = nickname)
        socket.to(roomName).emit('new_message', `${nickname}님이 입장`)
    });
});

const handleListen = ()=> console.log(`Listening on http://localhost:${app.get('port')}`);
httpServer.listen(app.get('port'), handleListen);