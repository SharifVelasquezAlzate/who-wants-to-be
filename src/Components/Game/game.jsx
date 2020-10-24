import React, { useContext, useState, useEffect } from 'react';
import AppContext from '../AppContext';
import GameContext from '../GameContext';
import Question from './question.jsx';
import { socket } from '../../socket';
import Winners from '../Winners/winners';

function Game(){
    const context = useContext(AppContext);
    const game = context.game;
    let questionCounter = 0;
    let cortinaTiempoSubida = false;
    let leaderboard = '';
    const [properties, setProperties] = useState({actualQuestion: game.questions[questionCounter], questionCounter: questionCounter, timePerQuestion: game.timePerQuestion});
    const [winnerProperties, setWinnerProperties] = useState({showWinners: false, leaderboard: {}});

    const variables = {
        alreadySubmitted: false
    }

    //FUNCTIONS
    const curtainDown = async () => {
        const telon = document.getElementsByClassName('telon').item(0);
        telon.style.opacity = 0;
        telon.style.zIndex = -1;
        await telon.classList.remove('mostrarHaciaArriba');
        await telon.classList.add('mostrarHaciaAbajo');
    }

    const curtainTimeDown = async () => {
        if (cortinaTiempoSubida){
            const telonTiempo = document.getElementsByClassName('telonTiempo').item(0);
            telonTiempo.style.opacity = 0;
            telonTiempo.style.zIndex = -1;
            await telonTiempo.classList.remove('mostrarHaciaArriba');
            await telonTiempo.classList.add('mostrarHaciaAbajo');
            cortinaTiempoSubida = false;
        }
    }
    const curtainTimeUp = async () => {
        const telonTiempo = document.getElementsByClassName('telonTiempo').item(0);
        telonTiempo.style.opacity = 1;
        telonTiempo.style.zIndex = 1;
        await telonTiempo.classList.remove('mostrarHaciaAbajo');
        telonTiempo.classList.add('mostrarHaciaArriba');
        cortinaTiempoSubida = true;
    }

    async function nextQuestion(){
        curtainTimeDown();
        questionCounter++;
        if(game.questions[questionCounter] !== undefined){
            setProperties({actualQuestion: game.questions[questionCounter], questionCounter: questionCounter, timePerQuestion: game.timePerQuestion});
            variables.alreadySubmitted = false;
        } else {
            const payLoad = {
                "method" : "showWinners",
                "gameId" : context.gameId,
                "clientId" : context.clientId
            }
            socket.emit('message', JSON.stringify(payLoad));
        }
        let options = document.getElementsByClassName('option');
        for (let i = 0; i < options.length; i++){
            options.item(i).style = null;
        }
    }

    //Messages
    useEffect(() => {
        socket.on('message', async message => {
            const response = JSON.parse(message);
            if(response.method === 'submitAnswer'){
                curtainDown();
                leaderboard = response.leaderboard;
                let options = document.getElementsByClassName('option');
                if (response.answerWasRight){ //If answer is the right one...
                    for (var i = 0; i < options.length; i++){
                        if (options.item(i).innerText === response.answer){
                            options.item(i).style.background = 'rgba(63, 231, 9, 0.8)';
                            options.item(i).style.border = 'solid rgba(63, 231, 9, 0.8) 3px';
                        }
                    }
                } else {
                    for (let i = 0; i < options.length; i++){
                        if (options.item(i).innerText === response.answer){
                            options.item(i).style.background = 'red';
                            options.item(i).style.border = 'solid red 3px';
                        }
                    }
                }
                setTimeout(nextQuestion, 3000);
            }

            if(response.method === "showWinners"){
                setWinnerProperties({showWinners: true, leaderboard: response.leaderboard});
            }

            if(response.method === "timeEnded"){
                curtainTimeUp();
                setTimeout(nextQuestion, 3000);
            }
        });
    }, []);

    if(winnerProperties.showWinners){
        return(
            <Winners leaderboard={winnerProperties.leaderboard}/>
        )
    } else {
        return(
            <GameContext.Provider value={variables}>
                <Question props={properties}/>
            </GameContext.Provider>
        )
    }
}

export default Game;
