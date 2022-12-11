import express from "express";
import http from "http";
import * as socketio from "socket.io";
import createGame from "../game.js";

const app = express();
const server = http.createServer(app);
const sockets = new socketio.Server(server)

app.use(express.static('public'));
app.use(express.static('src'));

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
    console.log(game.state.fruits)
    game.movePlayer(command)
  })

  socket.on('get-fruit', (command) => {
    console.log(`Player ${socket.id} get fruit ${command.fruitId}`)
  })
})



server.listen(3000, () => {
  console.log(`server listening on port ${3000}`)
});