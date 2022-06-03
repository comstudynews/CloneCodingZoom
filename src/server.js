import express from "express";

const app = express();

app.set('port', 3000);
app.set("view engine", "pug")
app.set('views', __dirname + '/views');

app.use('/public', express.static(__dirname + '/public'))

app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => {
    console.log("Listening on http://localhost:" + app.get('port'));
}
app.listen(app.get('port'), handleListen);