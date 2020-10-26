import React, { useContext, useEffect, useRef, useState } from 'react';
import './question.css';
import { socket } from '../../socket';
import AppContext from '../AppContext';

function Question(props){
    const context = useContext(AppContext);
    const actualQuestion = props.props.actualQuestion;
    const questionCounter = props.props.questionCounter;
    const timePerQuestion = props.props.timePerQuestion;
    const counterHTML = useRef(null)
    const [optionClicked, setOptionClicked] = useState('');
    let options = null;
    let element = null;
    const[x, setX] = useState('');
    let formSubmitted = 0;

    //Functions
    const curtainUp = async () => {
        const telon = document.getElementsByClassName('telon').item(0);
        telon.style.opacity = 1;
        telon.style.zIndex = 1;
        await telon.classList.remove('mostrarHaciaAbajo');
        telon.classList.add('mostrarHaciaArriba');
    }

    const curtainDown = async () => {
        const telon = document.getElementsByClassName('telon').item(0);
        telon.style.opacity = 0;
        telon.style.zIndex = -1;
        await telon.classList.remove('mostrarHaciaArriba');
        await telon.classList.add('mostrarHaciaAbajo');
    }

    function startCounter(time){
        document.getElementById('counter').style.color = 'white';
        let countDownDate = new Date();
        countDownDate = new Date(countDownDate.getTime() + time);
        setX(setInterval(function() {
          var now = new Date().getTime();
          var distance = countDownDate - now;
          var seconds = (distance % (1000 * 60)) / 1000;

          document.getElementById("counter").innerHTML = `${seconds.toFixed(2)}`;
          if(distance < 5000){
              document.getElementById('counter').style.color = 'red';
          }

          if(distance < 0){
            clearInterval(x);
          }
        }, 100));
    }

    //Messages
    useEffect(() => {
        options = document.getElementsByClassName('option');
        console.log("And these are the options:", options);
        for (var i = 0; i < options.length; i++){
            element = options.item(i);
            element.addEventListener('click', (event) => {
                for(let i=0; i < options.length; i++){
                    options.item(i).style.cssText = 'background: rgba(9, 231, 217, 0);';
                }
                event.target.style.cssText = 'background: rgba(9, 231, 217, 1);';
                console.log("El event.target:", event.target)
                setOptionClicked(event.target);
                console.log("And you clicked this:", optionClicked);
            });
        }
        console.log("Y bueno chavales, aqui en el useEffect!", optionClicked);
        startCounter(timePerQuestion*1000);
    }, []);

    function submitHandler(event){
        event.preventDefault();
        console.log('HAS SUBMITTEADO!', formSubmitted, optionClicked.innerText);
        if (formSubmitted < 1){
            clearInterval(x);
            const payLoad = {
                "method" : "submitAnswer",
                "clientId" : context.clientId,
                "gameId" : context.gameId,
                "questionNumber" : questionCounter,
                "answer" : optionClicked.innerText
            }
            socket.emit('message', JSON.stringify(payLoad));
            curtainUp();
            formSubmitted++;
        }
    }

    return(
        <div id='container'>
        <div>
            <div className="telon" style={{background: 'white'}}>
                <h1 style={{color: 'black'}}>Esperando a que los demás respondan...</h1>
            </div>
            <div className="telonTiempo telon" style={{background: 'red'}}>
                <h1 style={{color: 'white'}}>¡Se acabó el tiempo!</h1>
            </div>
            <div id="counter" ref={counterHTML}></div>
            <div className="question">
                {actualQuestion.question}
            </div>
            <form id="form">
                <div className="options">
                    <div className="option" id="a">{actualQuestion.options[0]}</div>
                    <div className="option" id="b">{actualQuestion.options[1]}</div>
                    <div className="option" id="c">{actualQuestion.options[2]}</div>
                    <div className="option" id="c">{actualQuestion.options[3]}</div>
                </div>
                <div style={{display: 'flex', justifyContent: 'center', width: '100%', marginTop: '30px'}}>
                    <input type="submit" value="Definitive answer" id="buttonSubmitAnswer" onClick={submitHandler}/>
                </div>
            </form>
        </div>
        </div>
    )
}

export default Question;
