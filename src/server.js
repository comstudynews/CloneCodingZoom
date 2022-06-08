import http from 'http';
import SocketIO from 'socket.io';
import express from "express";

const app = express();

app.set('port', 3000);
app.set("view engine", "pug")
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'))
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));


const httpServer = http.createServer(app);
const handleListen = ()=> console.log(`Listening on http://localhost:${app.get('port')}`);
httpServer.listen(app.get('port'), handleListen);
const wsSocket = SocketIO(httpServer);