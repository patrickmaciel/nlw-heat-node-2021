import "dotenv/config";
import express from 'express';
import { router } from './routes';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();
app.use(cors());

const serverHttp = http.createServer(app);
const io = new Server(serverHttp, {
  cors: {
    origin: '*'
  }
});
io.on('connection', socket => {
  console.log(`Usuário conectado no socket ${socket.id}`);
});

app.use(express.json());

app.use(router);

app.get('/github', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`);
});

app.get('/signin/callback', (req, res) => {
    const { code } = req.query;
    return res.json(code);
});

// Foi feita essa alteração pois quem irá agora subir o servidor, não é mais o app,
// e sim o server HTTP, isso para que seja possível utilizar o websocket
// app.listen(4000), () => console.log('🚀 Listening on port 4000');
// serverHttp.listen(4000), () => console.log('🚀 Listening on port 4000');

export { serverHttp, io };
