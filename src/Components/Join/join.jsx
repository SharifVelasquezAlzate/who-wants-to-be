import React, {  useContext, useRef, useEffect, Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import AppContext from '../AppContext';
import { paintParticipants } from './join.js';
import { socket } from '../../socket';
import './join.css';

function JoinGame(){
    const context = useContext(AppContext);
    const history =  useHistory();
    var game = context.game;
    let buttonAdmin = '';
    //References
    const divQuestion = useRef(null);
    const divParticipants = useRef(null);

    //Messages
    useEffect(() => {
        socket.on('message', message => {
            const response = JSON.parse(message);
            if(response.method === 'join'){
                context.game = response.game;
                paintParticipants(context.game);
            }
            if(response.method === 'startGame'){
                console.log(response, context.clientId);
                if (response.game.admin === context.clientId){
                    history.push('/control');
                } else {
                    history.push('/game');
                }
            }
        });
    })

    //Code
    useEffect(() => {
        paintParticipants(context.game);
        if (game.admin === context.clientId){
            let upContainer = document.getElementById('upContainer');
            buttonAdmin = document.createElement('button');
            buttonAdmin.id = "buttonStartGame";
            buttonAdmin.textContent = 'Start the game'
            buttonAdmin.addEventListener('click', () => {
                const payLoad = {
                    "method" : "startGame",
                    "clientId" : context.clientId,
                    "game" : context.game
                }
                socket.emit('message', JSON.stringify(payLoad));
            });
            upContainer.appendChild(buttonAdmin);
        }
    });
    return(
        <div id="cajaMenor">
            <div id="upContainer"><div id="gameCodeContainer">{game.id}</div></div>
            <div id="divQuestion" ref={divQuestion}>
                <div id="divParticipants" ref={divParticipants}></div>
            </div>
        </div>
    );
}

export default JoinGame;