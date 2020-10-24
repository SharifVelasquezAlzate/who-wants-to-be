import React, { useContext, useEffect, useRef } from 'react';
import './question.css';
import { socket } from '../../socket';
import AppContext from '../AppContext';
import GameContext  from '../GameContext';

function Question(props){
    const context = useContext(AppContext);
    const gameContext = useContext(GameContext);
    //const [actualQuestion, setActualQuestion] = useState(game.questions[questionCounter]);
    const actualQuestion = props.props.actualQuestion;
    const questionCounter = props.props.questionCounter;
    const timePerQuestion = props.props.timePerQuestion;
    const counterHTML = useRef(null)
    let optionClicked = '';
    let options = null;
    let element = null;
    let x = '';
    let formSubmitted = 0;

    //Functions
    const curtainUp = async () => {
        const telon = document.getElementsByClassName('telon').item(0);
        telon.style.opacity = 1;
        telon.style.zIndex = 1;
        await telon.classList.remove('mostrarHaciaAbajo');
        telon.classList.add('mostrarHaciaArriba');
    }

    function startCounter(time){
        document.getElementById('counter').style.color = 'white';
        let countDownDate = new Date();
        countDownDate = new Date(countDownDate.getTime() + time);
        x = setInterval(function() {
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
        }, 100);
    }

    //Messages
    useEffect(() => {
        options = document.getElementsByClassName('option');
        for (var i = 0; i <options.length; i++){
            element = options.item(i);
            element.addEventListener('click', (event) => {
                event.target.style.cssText = 'background: rgba(9, 231, 217, 1);';
                if (optionClicked !== '' && optionClicked !== event.target){
                    optionClicked.style.cssText = 'background: rgba(9, 231, 217, 0);';
                }
                optionClicked = event.target;
            });
        }

        startCounter(timePerQuestion*1000);
    });

    function submitHandler(event){
        event.preventDefault();
        console.log('HAS SUBMITTEADO!', formSubmitted);
        if (formSubmitted < 1){
            clearInterval(x);
            console.log('INTERVALO CLINEADO');
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
            gameContext.alreadySubmitted = true;
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
