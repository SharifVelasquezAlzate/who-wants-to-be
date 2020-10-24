import React, { useContext, useRef, useEffect } from 'react';
import colorAnswer from './create.js';
import { socket } from '../../socket';
//Functions
import AppContext from '../AppContext';
//CSS
import './create.css';

function CreateGame(){
    const context = useContext(AppContext);
    const questionsContainer = useRef(null);
    const inputTimePerQuestion = useRef(null);
    //Normal variables
    let questionsArray = [];
    let questionId = 0;
    let timePerQuestion = 10;

    //Messages
    useEffect(() => {
        socket.on('message', message => {
            const result = JSON.parse(message);
            if(result.method === "postQuestion"){
                alert(`El codigo es: ${result.gameId}`);
                context.gameId = result.gameId;
            }
        })
    }, []);

    //FUNCTIONS
    function SubmitClickHandler(event){
        event.preventDefault();
        let questions = document.getElementsByClassName('questionOptionsBox');
        (inputTimePerQuestion.current.value != '') ? timePerQuestion = inputTimePerQuestion.current.value : timePerQuestion = 10;
        questionsArray = [];
        for (var i = 0; i < questions.length; i++){
            let optionsList = [];
            let questionObject = {};
            var preguntaActual = questions.item(i);
            var options = preguntaActual.getElementsByClassName('optionInput');
            var question = preguntaActual.getElementsByClassName('questionInput').item(0).value;
            for (var it = 0; it < options.length; it++){
                var opcion = options.item(it);
                optionsList.push(opcion.value);
            }
            questionObject.options = optionsList;
            questionObject.question = question;
            questionObject.questionNumber = i;
            questionObject.answer = preguntaActual.getAttribute('rightanswer');
            questionsArray.push(questionObject);
        }
        
        const payLoad = {
            method : "postQuestion",
            questions : questionsArray,
            timePerQuestion: timePerQuestion,
            admin : context.clientId
        }
        socket.emit('message', JSON.stringify(payLoad));
    }
    function AddQuestionClickHandler(){
        questionId++;
        let divQuestions = document.createElement('div');
        let questionIdAttribute = document.createAttribute('questionId');
        questionIdAttribute.value = questionId;
        divQuestions.setAttributeNode(questionIdAttribute);
        divQuestions.className = 'questionOptionsBox';
        divQuestions.innerHTML = `<div class="botonBorrar"><a href="#" class="linkBotonBorrar" id=${questionId}>X</a></div><input type="text" placeholder="Question" class="questionInput"/><div class="optionsContainer"><div class="optionContainer"><h3 class="optionLetter">A.</h3><input type="text" class="optionInput"/></div><div class="optionContainer"><h3 class="optionLetter">B.</h3><input type="text" class="optionInput"/></div><div class="optionContainer"><h3 class="optionLetter">C.</h3><input type="text" class="optionInput"/></div><div class="optionContainer"><h3 class="optionLetter">D.</h3><input type="text" class="optionInput"/></div></div>`
        questionsContainer.current.appendChild(divQuestions);
        let button = document.getElementById(questionId);
        button.addEventListener('click', event => {
            event.preventDefault();
            let divPresionado = button.parentNode.parentNode;
            console.log('Este fue el div presionado:', divPresionado);
            divPresionado.remove();
        });
        let optionLetter = document.getElementsByClassName('optionLetter');
        colorAnswer(optionLetter);
    }
    //CODE ITSELF
    return(
        <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center'}}>
            <div className="cajaMenor">
                <form className="questions">
                    <input type="text" placeholder="insert time per question" id="inputTimePerQuestion" ref={inputTimePerQuestion}/>
                    <div className="divTest" ref={questionsContainer}></div>
                    <div className="buttonSubmit" id="agnadirPregunta" style={{display: 'inline-block'}} onClick={AddQuestionClickHandler}>Añadir pregunta</div>
                    <input type="submit" value="Guardar preguntas" className="buttonSubmit" onClick={SubmitClickHandler} id="guardarTodo"/>
                </form>
            </div>
        </div>
    );
}

export default CreateGame;