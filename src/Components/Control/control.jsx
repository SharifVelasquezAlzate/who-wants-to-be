import React, { useState, useContext, useRef, useEffect } from 'react';
import { socket } from '../../socket';
import AppContext from '../AppContext';
import Winners from '../Winners/winners.jsx';

function Control(){
    const context = useContext(AppContext);
    const game = context.game;
    let questionCounter = 0;
    const [actualQuestion, setActualQuestion] = useState(game.questions[questionCounter]);
    const [properties, setProperties] = useState({showWinners: false, leaderboard: {}});
    const divParticipants = useRef(null);
    const divQuestion = useRef(null);

    let participants = game.clients;

    //Functions
    function nextQuestion() {
        questionCounter++;
        setActualQuestion(game.questions[questionCounter]);
        const payLoad = {
            "method" : "submitAnswer",
            "clientId" : context.clientId,
            "gameId" : context.gameId,
            "questionNumber" : questionCounter,
            "answer" : ''
        }
        socket.emit('message', JSON.stringify(payLoad));
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
            if(response.method === "submitAnswerControl"){
                let searchedClient = document.getElementById(response.clientId);
                searchedClient.style.background = `${searchedClient.style.background.substring(0, searchedClient.style.background.length - 6)}, 1)`;
            } 
            if (response.method === "submitAnswer"){
                function unnecessaryFunction(){
                    if (!(questionCounter + 1 >= game.questions.length)){
                        nextQuestion();
                    } else {
                        context.leaderboard = response.leaderboard;
                        setProperties({showWinners: true, leaderboard: response.leaderboard});
                    }
                } setTimeout(unnecessaryFunction, 6000);
            }
            if (response.method === "timeEnded"){
                function unnecessaryFunction(){
                    console.log("LAS QUESTIONS:", game.questions, game.questions.length);
                    if (!(questionCounter + 1 >= game.questions.length)){
                        nextQuestion();
                    } else {
                        context.leaderboard = response.leaderboard;
                        setProperties({showWinners: true, leaderboard: response.leaderboard});
                    }
                } setTimeout(unnecessaryFunction, 6000);
            }
        });

        participants.forEach(participant => {
            let divParticipant = document.createElement('div');
            divParticipant.className = 'divParticipant';
            divParticipant.style.background = `${participant.color}33`;
            divParticipant.textContent = participant.clientId;
            divParticipant.id = participant.clientId;
            divParticipants.current.appendChild(divParticipant);
        });
    }, []);

    if (!properties.showWinners){
        return(
            <div className="cajaCentrar">
                <div id="cajaMenor">
                    <div id="upContainer"><div id="gameCodeContainer">{game.id}</div><div>Game status</div></div>
                    <div id="divQuestion" ref={divQuestion}>
                        <div id="divParticipants" ref={divParticipants}></div>
                    </div>
                </div>
            </div>
        );
    } else {
        return(
            <Winners leaderboard={properties.leaderboard}/>
        )
    }
    
}

export default Control;