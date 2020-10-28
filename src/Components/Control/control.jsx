import React, { useState, useContext, useRef, useEffect } from 'react';
import { socket } from '../../socket';
import AppContext from '../AppContext';

function Control(){
    const context = useContext(AppContext);
    const game = context.game;
    let questionCounter = 0;
    const [actualQuestion, setActualQuestion] = useState(game.questions[questionCounter]);
    const divParticipants = useRef(null);

    let participants = game.clients;

    //Functions
    function nextQuestion() {
        questionCounter++;
        console.log("The question counter:", questionCounter);
        setActualQuestion(game.questions[questionCounter]);
        divParticipants.current.innerHTML = '';
        participants.forEach(participant => {
            let divi = document.createElement('div');
            divi.style.background = `${participant.color}1A`;
            divi.textContent = participant.clientId;
            divi.id = participant.clientId;
            divi.className = 'participantDiv';
            divParticipants.current.appendChild(divi);
        });
    }

    useEffect(() => {
        //Messages
        const payLoad = {
            "method" : "submitAnswer",
            "clientId" : context.clientId,
            "gameId" : context.gameId,
            "questionNumber" : questionCounter,
            "answer" : ''
        }
        socket.emit('message', JSON.stringify(payLoad));

        socket.on('control', message => {
            const response = JSON.parse(message);
            console.log('Un response:', response);
            if(response.method === "submitAnswerControl"){
                let searchedClient = document.getElementById(response.clientId);
                searchedClient.style.background = `${searchedClient.style.background.substring(0, searchedClient.style.background.length - 6)}, 1)`;
                console.log('El background de ahora:', searchedClient.style.background, searchedClient.style.background.substring(0, searchedClient.style.background.length - 6));
            } 
            if (response.method === "submitAnswer"){
                console.log('And.. IIt is this:', response);
                nextQuestion();
            }
            if (response.method === "timeEnded"){
                nextQuestion();
            }
        });

        participants.forEach(participant => {
            let divi = document.createElement('div');
            divi.style.width = '200px';
            divi.style.background = `${participant.color}33`;
            divi.textContent = participant.clientId;
            divi.id = participant.clientId;
            divParticipants.current.appendChild(divi);
        });
    }, []);

    return(
        <div>
            <h1>{actualQuestion.question}</h1>
            <div id="DivParticipants"  ref={divParticipants}>

            </div>
        </div>
    );
}

export default Control;