import React, { useEffect } from 'react';
import { useRef } from 'react';
import './leaderboard.css';
import AppContext from '../../AppContext';
import { useContext } from 'react';

function Leaderboard(props) {
    const divScores = useRef(null);
    const context = useContext(AppContext);
    let leaderboard = context.leaderboard;
    useEffect(() => {
        let maxScore = 0;
        leaderboard.forEach(element => {
            let divi = document.createElement('div');
            divi.style.background = element.color;
            divi.className = 'horizontalColumn';
            divi.innerHTML += `<div class="username">${element.clientId}</div><div class="score">${element.score}</div>`;
            if(parseInt(`${element.score}`) > maxScore){
                maxScore = parseInt(`${element.score}`);
            }
            divScores.current.appendChild(divi);
        });
        
        /*LEADERBOARD.JS*/
        let columns = document.getElementsByClassName('horizontalColumn');
        let horizontalColumn = '';
        let score = '';
        let username = '';
        let heightReference = columns[0].getBoundingClientRect().height;
        let y = heightReference + 15;
        let counter = 0;

        const leaderboardColumns = [];

        //Functions
        function sortByKey(array, key, key2){
            return [].slice.call(array).sort(function(a, b){
                if (a[key]===b[key]){
                    return (b[key2]-a[key2]); //a-b = lower --- b-a = higher
                 } else if(a[key]>b[key]){
                    return 1;
                 } else if(a[key]<b[key]){
                    return -1;
                 }
            });
        }

        for(let i = 0; i < columns.length; i++){
            horizontalColumn = columns.item(i);
            score = horizontalColumn.querySelector('.score').innerText;
            username = horizontalColumn.querySelector('.username').innerText;
            horizontalColumn.style.width = `${(100/maxScore)*parseInt(score)}%`;
            leaderboardColumns.push({'username' : username, 'score' : parseInt(score)});
        }

        (async function (){
            await sortByKey(leaderboardColumns, 'score', 'time');
            let canContinue = true;
            for(let i = 0; i < Object.keys(leaderboardColumns).length; i++){
                if (leaderboardColumns.username == undefined){
                    canContinue = false;
                }
            }
            if (canContinue){
                context.leaderboard = leaderboardColumns;
            }
        })();
        

        leaderboardColumns.forEach(element => {
            for(let i = 0; i < columns.length; i++){
                horizontalColumn = columns.item(i);
                username = horizontalColumn.querySelector('.username').innerText;
                if (element.username === username){
                    horizontalColumn.style.transform = `translateY(${(counter) * y - (i + 1) * y + 55}px)`;
                }
            }
            counter++;
        });
        /*LEADERBOARD.JS*/
    }, []);

    return(
        <div ref={divScores}></div>
    );
}

export default Leaderboard;