import express from "express";

const app = express();

app.set('port', 3000);

const handleListen = () => {
    console.log("Listening on http://localhost:" + app.get('port'));
}
app.listen(app.get('port'), handleListen);