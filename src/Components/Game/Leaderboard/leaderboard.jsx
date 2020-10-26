import React, { useEffect } from 'react';
import { useRef } from 'react';
import './leaderboard.css';

function Leaderboard({leaderboard}) {
    const divScores = useRef(null);

    useEffect(() => {
        leaderboard.forEach(element => {
            let divi = document.createElement('div');
            divi.style.background = element.color;
            divi.className = 'horizontalColumn';
            divi.innerHTML += `<div class="username">${element.clientId}</div><div class="score">${element.score}</div>`;
            divScores.current.appendChild(divi);
        });
        require('./leaderboard.js');
    })

    return(
        <div ref={divScores}></div>
    );
}

export default Leaderboard;