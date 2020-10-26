import React, { useState } from 'react';
import AppContext from './Components/AppContext';
import Login from './Components/Login/login';
import Home from './Components/Home/home';
import CreateGame from './Components/Create/create.jsx';
import JoinGame from './Components/Join/join.jsx';
import Game from './Components/Game/game';
import { socket } from './socket';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  const [clientId, setClientId] = useState(null);
  const [gameId, setGameId] = useState(null);

  let variables = {
    clientId: clientId,
    gameId: gameId,
    sock: socket,
    game: null,
    leaderboard: null,
    setClientId,
    setGameId
  }
  
  return (
    <AppContext.Provider value={variables}>
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
          <Route path="/">
            <Login/>
          </Route>
        </Switch>
      </Router>
    </AppContext.Provider>
  )
}

export default App;
