import React, { useEffect, useState } from 'react';
import AppContext from './Components/AppContext';
import Login from './Components/Login/login';
import Home from './Components/Home/home';
import CreateGame from './Components/Create/create.jsx';
import JoinGame from './Components/Join/join.jsx';
import Game from './Components/Game/game';
import Control from './Components/Control/control'
import { socket } from './socket';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  const [clientId, setClientId] = useState(null);
  const [gameId, setGameId] = useState(null);
  let toggleAudio = true;

  let variables = {
    clientId: clientId,
    gameId: gameId,
    sock: socket,
    game: null,
    leaderboard: null,
    setClientId,
    setGameId                             
  }

  //Functions
  function stopAllAudio(){
    toggleAudio = !toggleAudio;
    if(toggleAudio){
      document.getElementById('buttonStopAudio').style.background = `url('resources/Images/audio.png') no-repeat center center`;
    } else {
      document.getElementById('buttonStopAudio').style.background = `url('resources/Images/no-audio.png') no-repeat center center`;
    }
    const payLoad = {
      "method" : "stopAudio",
      "clientId" : variables.clientId
    }
    socket.emit('message', JSON.stringify(payLoad));
  }
  
  return (
    <AppContext.Provider value={variables}>
      <div id="containerButtonStopAudio" onClick={stopAllAudio}>
        <div id="buttonStopAudio">

        </div>
      </div>
      <Router>
        <Switch>
          <Route path="/home">
            <Home/>
          </Route>
          <Route path="/create">
            <CreateGame/>
          </Route>
          <Route path="/game">
            <Game/>
          </Route>
          <Route path='/wait'>
            <JoinGame/>
          </Route>
          <Route path='/control'>
            <Control/>
          </Route>
          <Route path="/">
            <Login/>
          </Route>
        </Switch>
      </Router>
    </AppContext.Provider>
  )
}

export default App;