/**
 * # Stages of the Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = function(stager, settings) {

    stager
        .next('precache')
        .next('selectLanguage')
        .next('instructions')
        .next('quiz')
        .repeat('ultimatum', settings.REPEAT)
        .next('questionnaire')
        .next('totalpayoff')
        .next('endgame')
        .gameover();

        stager.skip('instructions');
        stager.skip('selectLanguage');
        stager.skip('questionnaire');
        stager.skip('quiz');
        
        stager.extendStage('ultimatum', {steps: ['ultimatum1', 'feedback']});
};
