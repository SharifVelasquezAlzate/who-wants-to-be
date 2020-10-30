const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const randomColor = require('randomcolor');
const cors = require('cors');
const fetch = require('node-fetch');
const { response } = require('express');

//Intializations
const app = express();
const server = http.createServer(app);
const io = socketio(server);
let gamesFetch = '';
let games = {};

fetchGames();
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

//Routes
require('./db');
app.use('/api/games', require('./Routes/routes'));

//Static Files
app.use(express.static(__dirname + '/publicServer'));

//Start server
server.listen(app.get('port'), () => {
    console.log('Server started on port', app.get('port'))
});

server.on('error', err => {
    console.error(err);
});

//Functions
async function fetchGames(){
    const res = await fetch('http://localhost:8000/api/games/all');
    gamesFetch = await res.json();
    gamesFetch.forEach(element => {
        games[element.id] = {
            "id" : element.id,
            "questions" : element.questions,//{"a" : {question: "¿Cual es mi nombre?", options: ["Samuel", "Sharif", "Anstasio", "Perruni"], answer: "Sharif", answersSubmitted: 0, answers: []}, "b" : {question: "¿Cual es la tecnologia usada para correr javascript en el servidor?", options: ["Node.js", "Angular.js", "React.js", "Vue.js"], answer: "Node.js", answersSubmitted: 0, answers: []}, "c" : {question: "¿Como se llama Jonas?", options: ["Juanito", "Maria", "Tomas", "Jonas"], answer: "Jonas", answersSubmitted: 0, answers: []}},
            "clients" : [],
            "admin" : element.admin,
            "timePerQuestion" : parseInt(element.timePerQuestion),
            "leaderboard" : [],
            "started" : false
        }
    });
}

async function postGame(gameObject){
    const res = await fetch('http://localhost:8000/api/games', {
        method: 'POST',
        body: JSON.stringify(gameObject),
        headers: {
            'Content-Type' : 'application/json'
        }
    });
    const response = await res.json();
    return response;
}

const guid=()=> {
    /*
    const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
    */
    const s4 = () => Math.floor(Math.random() * (10 - 1)) + 1;
    return `${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}`;
}


function timeEnded(gameId, actualQuestionCounter){
    const payLoad = {
        "method" : "timeEnded",
        "leaderboard" : games[gameId].leaderboard
    }

    const game = games[gameId];
    
    game.clients.forEach(client => {
        let encontrado = false;
        if (client.clientId == game.admin){
            clients[client.clientId].connection.emit('control', JSON.stringify(payLoad));
        }
        game.questions[actualQuestionCounter].answers.forEach(element => {
            if(element.clientId === client.clientId){
                try{
                    clients[element.clientId].connection.emit('message', JSON.stringify(element));
                } catch {}
                encontrado = true;
            }
        })
        if(!encontrado){
            try{
                clients[client.clientId].connection.emit('message', JSON.stringify(payLoad));
            } catch {}
        }
    });

    function startCounterTimeout(){
        questionCounter = setTimeout(timeEnded, game.timePerQuestion*1000, gameId, actualQuestionCounter + 1);
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
            if (!game.started){
                const color = randomColor();
                game.clients.push({
                    "clientId" : clientId,
                    "color" : color
                });
                if (game.admin !== clientId){
                    game.leaderboard.push({
                        "clientId" :  clientId,
                        "score" : 0,
                        "time" : 0,
                        "color" : color
                    });
                }

                const payLoad = {
                    "method" : "join",
                    "game" : game
                }

                game.clients.forEach(client => {
                    clients[client.clientId].connection.emit('message', JSON.stringify(payLoad));
                });
            } else {
                const payLoad = {
                    "method" : "error",
                    "message" : "This game already started"
                }
                clients[clientId].connection.emit('message', JSON.stringify(payLoad));
            }
        }

        if (result.method == 'startGame'){
            const game = result.game;
            const payLoad = {
                "method" : "startGame",
                "game" : game
            }
            games[game.id].started = true;
            game.clients.forEach(client => {
                if (game.admin == client.clientId){
                    clients[client.clientId].connection.emit('message', JSON.stringify(payLoad));
                } else {
                    clients[client.clientId].connection.emit('message', JSON.stringify(payLoad));
                }
            });
            questionCounter = setTimeout(timeEnded, game.timePerQuestion*1000, game.id, 0);
        }

        if (result.method == "submitAnswer"){
            console.log('HELLOOOOO:', result);
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
                    game.leaderboard[temporalCounter].time += result.time;
                }
                temporalCounter++;
            });

            let payLoad = {
                "method" : "submitAnswerControl",
                "clientId" : result.clientId,
                "answer" : result.answer,
                "answerWasRight" : answerWasRight,
                "leaderboard" : game.leaderboard
            }

            clients[game.admin].connection.emit('control', JSON.stringify(payLoad));

            payLoad = {
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
                game.questions[result.questionNumber].answers.forEach(element => {
                    if (element.clientId !== game.admin){
                        clients[element.clientId].connection.emit('message', JSON.stringify(element));
                    } else {
                        clients[element.clientId].connection.emit('control', JSON.stringify(element));
                    }
                });
                game.questions[result.questionNumber].answers = []; 
            }
            function startCounterTimeout(){
                questionCounter = setTimeout(timeEnded, game.timePerQuestion*1000, gameId, result.questionNumber + 1);
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

            const gameToPost = {
                "id" : createdGameCode,
                "questions" : jsonQuestions.questions,//{"a" : {question: "¿Cual es mi nombre?", options: ["Samuel", "Sharif", "Anstasio", "Perruni"], answer: "Sharif", answersSubmitted: 0, answers: []}, "b" : {question: "¿Cual es la tecnologia usada para correr javascript en el servidor?", options: ["Node.js", "Angular.js", "React.js", "Vue.js"], answer: "Node.js", answersSubmitted: 0, answers: []}, "c" : {question: "¿Como se llama Jonas?", options: ["Juanito", "Maria", "Tomas", "Jonas"], answer: "Jonas", answersSubmitted: 0, answers: []}},
                "admin" : result.admin,
                "timePerQuestion" : result.timePerQuestion.toString(),
            }

            await postGame(gameToPost);
            await fetchGames();

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
        let aEliminar = [];
        clearTimeout(questionCounter);
            for (var client in clients){
                if (clients[client].connection == sock){
                    let clientIdSearched = clients[client].id;
                    delete clients[client];
                    aEliminar.push(clientIdSearched);
                }
            }
            console.log('Clients to delete:', aEliminar);
            for (var clientIdSearched in aEliminar){
                for (var game in games){
                    for (let i=0; i < games[game].clients.length - 1; i++){
                        if(games[game].leaderboard[i].clientId === clientIdSearched){
                            games[game].leaderboard.splice(i, 1);
                            aEliminar.push()
                        }
                        if(games[game].clients[i].clientId === clientIdSearched){
                            games[game].clients.splice(i, 1);
                            if(!games[game].started){
                                const payLoad = {
                                    "method" : "join",
                                    "game" : games[game]
                                }
                                games[game].clients.forEach(client => {
                                    clients[client.clientId].connection.emit('message', JSON.stringify(payLoad));
                                });
                            } else {
                                if (!(Array.isArray(games[game].clients) && games[game].clients.length)){
                                    games[game].started = false;
                                }
                            }
                        }
                    }
                }
            }
    });
});