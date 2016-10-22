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
        .next('quiz2')
        .repeat('choices', settings.REPEAT)
        .next('final')
//         .next('totalpayoff')
//         .next('questionnaire')
//         .next('endgame')
        .gameover();

    // stager.skip('instructions');
    stager.skip('selectLanguage');
    // stager.skip('questionnaire2');
    // stager.skip('questionnaire');
    // stager.skip('quiz');
    // stager.skip('quiz2');
    
    stager.extendStage('choices', {steps: ['decision', 'feedback']});

    stager.extendStage('final', {steps: [
        'totalpayoff',
        'questionnaire1',
        'questionnaire2',
        'questionnaire3',
        'endgame'
    ]})
};
