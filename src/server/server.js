import express from "express";
import http from "http";
import * as socketio from "socket.io";
import createGame from "../game.js";
import path from 'path';



const app = express();
const server = http.createServer(app);
const sockets = new socketio.Server(server)

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static(path.join(__dirname, '../../public')));

app.use(express.static(path.join(__dirname, '../../src')));

const game = createGame()

game.subscribe((command) => {
  console.log(`> Emmitting ${command.type}`)
  sockets.emit(command.type, command)
})

game.addFruit()


sockets.on('connection', (socket) => {
  const playerId = socket.id;

  game.addPlayer({ playerId: playerId })
  console.log(`>> Socket connected ${playerId}`)

  socket.emit('setup', game.state)

  socket.on('disconnect', () => {
    game.removePlayer({ playerId: playerId })
    console.log(`> Socket disconnected ${playerId}`)
  })

  socket.on('move-player', (command) => {
    game.movePlayer(command)
  })

  socket.on('get-fruit', (command) => {
    console.log(`Player ${command.playerId} get fruit ${command.fruitId}`)
    if(socket.id == command.playerId)
      game.addFruit()
  })
})



server.listen(3000, () => {
  console.log(`server listening on port ${3000}`)
});