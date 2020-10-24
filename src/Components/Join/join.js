function lightOrDark(color) {
    var r, g, b, hsp;
    if (color.match(/^rgb/)) {
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        r = color[1];
        g = color[2];
        b = color[3];
    } 
    else {
        color = +("0x" + color.slice(1).replace( 
        color.length < 5 && /./g, '$&$&'));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );
    if (hsp>127.5) {
        return 'light';
    } 
    else {
        return 'dark';
    }
}

function paintParticipants(game){
    let divParticipants = document.getElementById('divParticipants');
    divParticipants.innerHTML = '';
    for(let i = 0; i < game.clients.length; i++){
        let divParticipant = document.createElement('div');
        divParticipant.style.cssText = `width: 200px; padding: 10px; background:${game.clients[i].color}`;
        if (lightOrDark(game.clients[i].color) === 'dark'){
            divParticipant.style.color = 'white';
        }
        divParticipant.textContent = game.clients[i].clientId;
        divParticipants.appendChild(divParticipant);
    }

    
}

module.exports = { lightOrDark, paintParticipants };