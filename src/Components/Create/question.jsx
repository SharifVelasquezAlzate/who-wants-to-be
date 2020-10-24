import React from 'react';

function Question(questionId){
    return(
        <div class="questionOptionsBox" questionId={questionId}>
            <input type="text" placeholder="Question" class="questionInput"/>
            <div class="optionsContainer">
                <div class="optionContainer">
                    <h3 class="optionLetter">A.</h3>
                    <input type="text" class="optionInput"/>
                </div>
                <div class="optionContainer">
                    <h3 class="optionLetter">B.</h3>
                    <input type="text" class="optionInput"/>
                </div>
                <div class="optionContainer">
                    <h3 class="optionLetter">C.</h3>
                    <input type="text" class="optionInput"/>
                </div>
                <div class="optionContainer">
                    <h3 class="optionLetter">D.</h3>
                    <input type="text" class="optionInput"/>
                </div>
            </div>
        </div>
    )
}

export default Question;