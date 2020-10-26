const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const randomColor = require('randomcolor');
const cors = require('cors');

//Intializations
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const games = {};
const clients = {};
let clientId = '';
let questionCounter = '';
var clientIdSetted = false;

//Configurations
app.set('port', 8000);

//MiddleWares
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Start server
server.listen(app.get('port'), () => {
    console.log('Server started on port', app.get('port'))
});

server.on('error', err => {
    console.error(err);
});

//Functions
const guid=()=> {
    const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}


function timeEnded(gameId, actualQuestionCounter){
    const payLoad = {
        "method" : "timeEnded",
        "leaderboard" : games[gameId].leaderboard
    }

    const game = games[gameId];
    
    game.clients.forEach(client => {
        let encontrado = false;
        game.questions[actualQuestionCounter].answers.forEach(element => {
            if(element.clientId === client.clientId){
                clients[element.clientId].connection.emit('message', JSON.stringify(element));
                encontrado = true;
            }
        })
        if(!encontrado){
            clients[client.clientId].connection.emit('message', JSON.stringify(payLoad));
        }
    });

    function startCounterTimeout(){
        questionCounter = setTimeout(timeEnded, game.timePerQuestion*1000, gameId, actualQuestionCounter + 1);
        console.log('Nuevo contador iniciado');
    }
    
    setTimeout(startCounterTimeout, 6000);
}

io.on('connection', async (sock) => {
    //I have received a message from the client
    sock.on('message', async message => {
        const result = JSON.parse(message);
        if(result.method == 'setClientId'){
            clientId = result.clientId;
            if (!clients.hasOwnProperty(clientId)){
                clients[clientId] = {
                    "id" : clientId,
                    "connection" : sock
                }
                const payLoad = {
                    "method" : "setClientId",
                    "clientId" : clientId
                }
                sock.emit('message', JSON.stringify(payLoad));
                clientIdSetted = true;
            } else {
                const payLoad = {
                    "method" : "error",
                    "message" : "That clientId is already in use, please choose another one."
                }
                sock.emit('message', JSON.stringify(payLoad));
            }
        }
        if (clientIdSetted){
        if (result.method == "create") {
            const payLoad = {
                "method" : "create",
            }
            sock.send(JSON.stringify(payLoad))
        }
        if (result.method == "join"){
            const clientId = result.clientId;
            const gameId = result.gameId
            const game = games[gameId];
            const color = randomColor();
            game.clients.push({
                "clientId" : clientId,
                "color" : color
            });
            game.leaderboard.push({
                "clientId" :  clientId,
                "score" : 0,
                "color" : color
            });
            const payLoad = {
                "method" : "join",
                "game" : game
            }

            game.clients.forEach(client => {
                clients[client.clientId].connection.emit('message', JSON.stringify(payLoad));
            });

        }

        if (result.method == 'startGame'){
            const game = result.game;
            const payLoad = {
                "method" : "startGame",
                "game" : game
            }
            game.clients.forEach(client => {
                clients[client.clientId].connection.emit('message', JSON.stringify(payLoad));
            });
            questionCounter = setTimeout(timeEnded, game.timePerQuestion*1000, game.id, 0);
        }

        if (result.method == "submitAnswer"){
            const gameId = result.gameId;
            const game = games[gameId];
            game.questions[result.questionNumber].answersSubmitted++;
            var answerWasRight = false;
            if (result.answer == game.questions[result.questionNumber].answer){
                answerWasRight = true;
            }
            let temporalCounter = 0;
            game.leaderboard.forEach(client => {
                if (client.clientId == result.clientId){
                    if (answerWasRight){
                        game.leaderboard[temporalCounter].score++;
                    }
                }
                temporalCounter++;
            })
            const payLoad = {
                "method" : "submitAnswer",
                "clientId" : result.clientId,
                "answer" : result.answer,
                "answerWasRight" : answerWasRight,
                "leaderboard" : game.leaderboard
            }
            game.questions[result.questionNumber].answers.push(payLoad);
            if (game.questions[result.questionNumber].answersSubmitted >= game.clients.length){ //If everyone has submitted the answer we will send to everyone if that was right or not
                clearTimeout(questionCounter);
                setTimeout(startCounterTimeout, 6000); //Iniciar contador para la proxima pregunta
                console.log('LIMPIADO PORQUE TODOS RESPONDIERON', questionCounter._timerArgs);
                game.questions[result.questionNumber].answers.forEach(element => {
                    clients[element.clientId].connection.emit('message', JSON.stringify(element));
                });
                game.questions[result.questionNumber].answers = []; 
            }
            function startCounterTimeout(){
                questionCounter = setTimeout(timeEnded, game.timePerQuestion*1000, gameId, result.questionNumber + 1);
                console.log('Nuevo contador iniciado 2');
            }
            
        }

        //*** EDITING THE GAME || EDITING THE GAME || EDITING THE GAME ***//

        if (result.method == "postQuestion"){
            const jsonQuestions = {"questions" : []};
            const createdGameCode = guid();
            for (var i = 0; i < result.questions.length; i++){
                element = {question: result.questions[i].question, options: result.questions[i].options, answer: result.questions[i].answer, answersSubmitted: 0, answers: []}
                jsonQuestions.questions.push(element);
            }

            games[createdGameCode] = {
                "id" : createdGameCode,
                "questions" : jsonQuestions.questions,//{"a" : {question: "¿Cual es mi nombre?", options: ["Samuel", "Sharif", "Anstasio", "Perruni"], answer: "Sharif", answersSubmitted: 0, answers: []}, "b" : {question: "¿Cual es la tecnologia usada para correr javascript en el servidor?", options: ["Node.js", "Angular.js", "React.js", "Vue.js"], answer: "Node.js", answersSubmitted: 0, answers: []}, "c" : {question: "¿Como se llama Jonas?", options: ["Juanito", "Maria", "Tomas", "Jonas"], answer: "Jonas", answersSubmitted: 0, answers: []}},
                "clients" : [],
                "admin" : result.admin,
                "timePerQuestion" : result.timePerQuestion,
                "leaderboard" : []
            }

            const payLoad = {
                method: "postQuestion",
                gameId: createdGameCode
            }
            sock.emit('message', JSON.stringify(payLoad));
        }

        if(result.method == "showWinners"){
            const gameId = result.gameId;
            const leaderboard = (games[gameId].leaderboard).sort();
            const payLoad = {
                "method" : "showWinners",
                "leaderboard" : leaderboard
            }
            clearTimeout(questionCounter);
            clients[result.clientId].connection.emit('message', JSON.stringify(payLoad));
        }
        }
    });
    console.log('Someone is connected!');
    sock.on('disconnect', () => {
        console.log("Someone disconnected!");
        clearTimeout(questionCounter);
        for (var client in clients){
            if (clients[client].connection == sock){
                let clientIdSearched = client.id;
                for (var game in games){
                    if (games[game].clients.includes(clientIdSearched)){
                        delete games[game].clients[clientIdSearched];
                    }
                }
                delete clients[client];
            }
        }
    });
});