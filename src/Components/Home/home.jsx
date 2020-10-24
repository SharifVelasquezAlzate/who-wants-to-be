import React, {Fragment, useContext, useRef} from 'react';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AppContext from '../AppContext';
import { socket } from '../../socket';
import './home.css';

function Home(){
    const context = useContext(AppContext);
    const history = useHistory();
    //HTML Elements
    const buttonCreate = useRef(null);
    const buttonJoin = useRef(null);
    const inputGameId = useRef(null);
    const divQuestion = useRef(null);

    //Messages
    useEffect(() => {
        socket.on('message', message => {
            const response = JSON.parse(message);
            if(response.method === "create"){
                history.push('/create');
            }
            if(response.method === "join"){
                context.game = response.game;
                history.push('/wait');
            }
        });
    }, []);

    //Functions
    function buttonCreateClick(event){
        event.preventDefault();
        const payLoad = {
            "method" : "create",
            "clientId" : context.clientId
        }
        socket.emit('message', JSON.stringify(payLoad));
    }

    function buttonJoinClick(event){
        event.preventDefault();
        if (context.gameId == null){
            context.gameId = inputGameId.current.value;
        }
        const payLoad = {
            "method" : "join",
            "clientId" : context.clientId,
            "gameId" : context.gameId
        };
        socket.emit('message', JSON.stringify(payLoad));
    }

    return(
        <Fragment>
            <div className="createJoinWrapper" id="CreateJoinWraper">
                <div style={{border: "3px solid black", padding: "0 20px 20px 20px", borderRadius: "20px"}}>
                    <h1 className="createJoinTitle">Hello friend!</h1>
                    <button className="standard-button createJoinCreateButton" ref={buttonCreate} onClick={buttonCreateClick}>Create Game</button>
                    <div style={{marginTop: "10px"}}>
                        <button className="standard-button createJoinJoinButton" ref={buttonJoin} onClick={buttonJoinClick}>Join Game</button>
                        <input type="text" className="createJoinJoinInput" ref={inputGameId}/>
                    </div>
                </div>
            </div>
            <div ref={divQuestion}></div>
        </Fragment>
    );
}

export default Home;