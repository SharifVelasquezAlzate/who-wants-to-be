import React, { useRef } from 'react';
import { useEffect } from 'react';
import './winners.css';

function Winners(props){
    const winnersLeaderboard = useRef(null);
    useEffect(() => {
        const leaderboard = sortByKey(props.leaderboard, 'score').reverse();
        //Functions
        function sortByKey(array, key){
            return [].slice.call(array).sort(function(a, b){
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        let winnerBox = document.getElementById('winner');
        winnerBox.textContent = `Ganador: ${leaderboard[0].clientId} (puntaje: ${leaderboard[0].score})`;

        for (let i = 0; i < leaderboard.length; i++){
            let player = leaderboard[i];
            let div = document.createElement('div');
            div.className = 'participantBox';
            winnersLeaderboard.current.appendChild(div);

            let playerBox = document.createElement('div');
            playerBox.textContent = `${i + 1}. ${player.clientId}`;
            playerBox.className = 'playerBox';
            div.appendChild(playerBox);

            let scoreBox = document.createElement('div');
            scoreBox.textContent = `${player.score}`;
            scoreBox.className = 'scoreBox';
            div.appendChild(scoreBox);
        }
    }, []);

    return(
        <div id='bigWrapper'>
            <div id="columnWrapper">
                <div id="leaderboard">
                    <div id="winner"></div>
                    <div id="participantsLeaderboard" ref={winnersLeaderboard}></div>
                </div>
            </div>
        </div>
    )
}

export default Winners;