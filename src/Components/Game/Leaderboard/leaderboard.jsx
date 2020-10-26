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
        leaderboard.forEach(element => {
            let divi = document.createElement('div');
            divi.style.background = element.color;
            divi.className = 'horizontalColumn';
            divi.innerHTML += `<div class="username">${element.clientId}</div><div class="score">${element.score}</div>`;
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
        function sortByKey(array, key){
            return array.sort(function(a, b){
                var x = a[key]; var y = b[key];
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            });
        }

        for(let i = 0; i < columns.length; i++){
            horizontalColumn = columns.item(i);
            score = horizontalColumn.querySelector('.score').innerText;
            username = horizontalColumn.querySelector('.username').innerText;
            //horizontalColumn.style.width = `${parseInt(score)*10}%`;
            leaderboardColumns.push({'username' : username, 'score' : parseInt(score)});
        }

        (async function (){
            await sortByKey(leaderboardColumns, 'score');
            console.log("And these are the two I need...", leaderboardColumns);
            let canContinue = true;
            for(let i = 0; i < Object.keys(leaderboardColumns).length; i++){
                console.log("Y el username:", leaderboardColumns.username)
                if (leaderboardColumns.username == undefined){
                    canContinue = false;
                    console.log("And... You are undefined...");
                }
            }
            if (canContinue){
                context.leaderboard = leaderboardColumns;
                console.log(context.leaderboard);
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