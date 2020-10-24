import React, {  useContext, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AppContext from '../AppContext';
import { paintParticipants } from './join.js';
import { socket } from '../../socket';

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
                history.push('/game');
            }
        });
    })

    //Code
    useEffect(() => {
        paintParticipants(context.game);
        if (game.admin === context.clientId){
            let divQuestion = document.getElementById('divQuestion');
            buttonAdmin = document.createElement('button');
            buttonAdmin.className = "standard-button";
            buttonAdmin.id = "buttonAdmin";
            buttonAdmin.textContent = 'You are the admin!'
            buttonAdmin.style.cssText = 'margin-top: 10px;';
            buttonAdmin.addEventListener('click', () => {
                const payLoad = {
                    "method" : "startGame",
                    "clientId" : context.clientId,
                    "game" : context.game
                }
                socket.emit('message', JSON.stringify(payLoad));
            });
            divQuestion.appendChild(buttonAdmin);
        }
    });
    return(
        <div id="divQuestion" ref={divQuestion}><div id="divParticipants" ref={divParticipants}></div></div>
    );
}

export default JoinGame;