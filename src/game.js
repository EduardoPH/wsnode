export default function createGame() {
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: 10,
      height: 10
    }
  }

  const observers = []

  function subscribe(observerFunction) {
    observers.push(observerFunction)
  }

  function notifyAll(command) {
    for(const observerFunction of observers) {
      observerFunction(command)
    }
  }

  function start() {
    const frequency = 10000;

    setInterval(addFruit, frequency);
  }

  function setState(newState) {
    Object.assign(state, newState)
  }

  function addPlayer(command) {
    const playerId = command.playerId;
    const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width);
    const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height);

    state.players[playerId] = {
      x: playerX,
      y: playerY
    }

    notifyAll({
      type: 'add-player',
      playerId: playerId,
      playerX: playerX,
      playerY: playerY
    })
  }

  function removePlayer(command) {
    const playerId = command.playerId;

    delete state.players[playerId];
    notifyAll({
      type: 'remove-player',
      playerId: playerId
    })
  }

  function addFruit(command) {
    const fruitId = command ? command.fruitId : Math.floor(Math.random() * 1000);
    const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width);
    const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height);

    state.fruits[fruitId] = {
      x: fruitX,
      y: fruitY
    }

    notifyAll({
      type: 'add-fruit',
      fruitId: fruitId,
      fruitX: fruitX,
      fruitY: fruitY
    })
  }

  function removeFruit(command) {
    const fruitId = command.fruitId;
    delete state.fruits[fruitId];

    notifyAll({
      type: 'remove-fruit',
      fruitId: fruitId,
      playerId: command.playerId
    })
  }

  function movePlayer(command) {     

    notifyAll(command)
    
    const keyPressed = command.keyPressed
    const player = state.players[command.playerId]

    const acceptedMoves = {
      w(player) {
        if(player.y > 0)
          player.y = player.y - 1
      },
      ArrowUp(player) {
        if(player.y > 0)
          player.y = player.y - 1
      },
      s(player) {
        if(player.y + 1 < state.screen.height)
          player.y = player.y + 1
      },
      ArrowDown(player) {
        if(player.y + 1 < state.screen.height)
          player.y = player.y + 1
      },
      a(player) {
        if(player.x > 0)
          player.x = player.x - 1
      },
      ArrowLeft(player) {
        if(player.x > 0)
          player.x = player.x - 1
      },
      d(player) {
        if(player.x + 1 < state.screen.width)
          player.x = player.x + 1;
      },
      ArrowRight(player) {
        if(player.x + 1 < state.screen.width)
          player.x = player.x + 1;
      }
    }

    const moveFunction = acceptedMoves[keyPressed]
    const playerId = command.playerId;

    if(player && moveFunction){
      moveFunction(player)
      checkForFruitCollision(playerId)
    }
  }

  function addPoint(command) {
    const player = state.players[command.playerId]
    player.points += 1;
    state.players[command.playerId] = player
    notifyAll(command)
  }

  function checkForFruitCollision(playerId) {
    const player = state.players[playerId]

    for(const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId]

      if(player.y === fruit.y && player.x === fruit.x) {
        console.log('Fruit collision detected')
        const command = {
          type: 'get-fruit',
          playerId: playerId,
          fruitId: fruitId
        }

        notifyAll(command)

        removeFruit({fruitId: fruitId, playerId: playerId})
      }
    }
  }

  return {
    movePlayer,
    state,
    addPlayer,
    removePlayer,
    addFruit,
    removeFruit,
    setState,
    subscribe,
    start,
    addPoint
  }
}
