import React, {useContext, useRef} from 'react';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { socket } from '../../socket';
import AppContext from '../AppContext';
import './login.css';

function Login(){
    const context = useContext(AppContext);
    const history = useHistory();
    //HTML Elements
    const inputUsername = useRef(null);
    const buttonStart = useRef(null);
    //Messages
    useEffect(() =>{
        socket.on('message', message => {
            const response = JSON.parse(message);
            if (response.method === 'setClientId'){
                console.log("ClientId set successful with id:", response.clientId);
                history.push("/home");
            }
        });
    }, []);

    //Code itself
    function clickHandler(e){
        e.preventDefault();
        context.clientId = inputUsername.current.value;
        if (context.clientId !== '' && context.clientId !== 'null'){
            const payLoad = {
                "method" : "setClientId",
                "clientId" : context.clientId
            }
            socket.emit('message', JSON.stringify(payLoad));
        }
    }

    function keyUpHandler(e){
        if (e.key === 'Enter') {
            e.preventDefault();
            buttonStart.current.click();
        }
    }

    return(
        <form id="userForm" className="whatUsernameForm">
            <div className="whatUsernameBox">
                <h1 className="whatUsernameTitle">Whats your username?</h1><br/>
                <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                    <input type="text" ref={inputUsername} style={{marginRight: '10px'}} className="whatUsernameInput" onKeyUp={keyUpHandler} autoFocus={true}/>
                    <button ref={buttonStart} className="whatUsernameButton" onClick={clickHandler}>Start playing!</button>
                </div>
            </div>
        </form>
    );
}

export default Login;
