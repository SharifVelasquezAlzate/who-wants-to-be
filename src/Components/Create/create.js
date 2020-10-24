let h3Letter = '';
const colorAnswer = (optionLetter) => {
    for (var i = 0; i < optionLetter.length; i++){
        optionLetter.item(i).addEventListener('click', event => {
            try{
                var optionLetter2 = ((event.target).parentNode.parentNode).querySelectorAll('.optionLetter');
                for (var j = 0; j < optionLetter2.length; j++){
                    if (optionLetter2.item(j).style.color === 'rgb(89, 255, 0)'){
                        optionLetter2.item(j).style.color = `black`;
                    }
                }
            } catch {}
            var rightAnswer = (event.target.parentNode).querySelector('.optionInput');
            var rightAnswerValue = rightAnswer.value;
            var atributoRespuestaCorrecta = document.createAttribute('rightanswer');
            atributoRespuestaCorrecta.value = rightAnswerValue;
            (((event.target.parentNode).parentNode).parentNode).setAttributeNode(atributoRespuestaCorrecta);
            h3Letter = event.target;
            (event.target).style.color = `rgb(89, 255, 0)`;
        });
    }
    return null;
}

export default colorAnswer;