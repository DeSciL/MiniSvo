/**
 * # Player code for MiniSvo Game
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var game, MIN_PLAYERS;
    var cbs;

    var channel = gameRoom.channel;
    var node = gameRoom.node;

    // The game object to return at the end of the function.
    game = {};

    // Import other functions used in the game.

    cbs = require(__dirname + '/includes/player.callbacks.js');

    // Specify init function, and extend default stages.

    // Init callback.
    stager.setOnInit(cbs.init);

    stager.setOnGameOver(function() {
        // Do something if you like!
    });

    // Add all the stages into the stager.

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // A minimal stage must contain two properties:
    //
    // - id: a unique name for the stage
    // - cb: a callback function to execute once
    //     the stage is loaded.
    //
    // When adding a stage / step into the stager
    // there are many additional options to
    // configure it.
    //
    // Properties defined at higher levels are
    // inherited by each nested step, that in turn
    // can overwrite them.
    //
    // For example if a step is missing a property,
    // it will be looked into the enclosing stage.
    // If it is not defined in the stage,
    // the value set with _setDefaultProperties()_
    // will be used. If still not found, it will
    // fallback to nodeGame defaults.
    //
    // The most important properties are used
    // and explained below.
    //
    /////////////////////////////////////////////

    // A step rule is a function deciding what to do when a player has
    // terminated a step and entered the stage level _DONE_.
    // Other stepRules are: SOLO, SYNC_STAGE, SYNC_STEP, OTHERS_SYNC_STEP.
    // In this case the client will wait for a command from the server.
    stager.setDefaultStepRule(stepRules.WAIT);

    stager.setDefaultProperty('done', cbs.clearFrame);

    MIN_PLAYERS = [ settings.MIN_PLAYERS, cbs.notEnoughPlayers ];

    stager.extendStep('selectLanguage', {
        frame: 'languageSelection.html',
        cb: cbs.selectLanguage,
        timer: 100000,
        // minPlayers: MIN_PLAYERS,
        done: function() {
            // The chosen language prefix will be
            // added automatically to every call to W.loadFrame().
            if (node.player.lang.name !== 'English') {
                W.setUriPrefix(node.player.lang.path);
                node.say('mylang', 'SERVER', node.player.lang);
            }
            return true;
        }
    });

    stager.extendStep('precache', {
        cb: cbs.precache,
        // `minPlayers` triggers the execution of a callback in the case
        // the number of players (including this client) falls the below
        // the chosen threshold. Related: `maxPlayers`, and `exactPlayers`.
        // minPlayers: MIN_PLAYERS,
        // syncOnLoaded: true,
    });

    stager.extendStep('instructions', {
        frame: settings.instructionsPage,
        cb: cbs.instructions,
        // minPlayers: MIN_PLAYERS,
        // syncOnLoaded: true,
        timer: 90000
    });

    stager.extendStep('quiz', {
        frame: 'quiz.html',
        cb: cbs.quiz,
    });
    
    stager.extendStep('quiz2', {
        frame: 'quiz2.html',
        cb: cbs.quiz2
    });

    stager.extendStep('decision', {
        frame: 'decision.html',
        cb: cbs.choices,
        // minPlayers: MIN_PLAYERS,
        // `syncOnLoaded` forces the clients to wait for all the others to be
        // fully loaded before releasing the control of the screen to the
        // players.  This options introduces a little overhead in
        // communications and delay in the execution of a stage. It is probably
        // not necessary in local networks, and it is FALSE by default.
        // syncOnLoaded: true
        timeup: function() {
            node.done({
                pushTimeup: true,
            });
        }
    });
    
    stager.extendStep('feedback', {
        // Carry along the partner.
        partner: function() { return this.partner; },
        //frame: 'feedback_next.html',
        frame: settings.feedbackPage,
        cb: cbs.feedback,
        // minPlayers: MIN_PLAYERS,
    });

    stager.extendStage('final', {
        stepRule: stepRules.SOLO
    });
    
    stager.extendStep('totalpayoff', {
        frame: 'totalpayoff.html',
        cb: cbs.totalpayoff
    });

    stager.extendStep('endgame', {
        frame: 'ended.html',
        cb: cbs.endgame
    });

    stager.extendStep('questionnaire1', {
        frame: settings.postgamePage,
        cb: function () {
            
            var treatment = node.env('treatment');
            // Don't show this step for no feedback treatment
            if (treatment == 'none') {
                //HACK: Delay node.done() a little bit, otherwise it jumps multiple steps ahead
                setTimeout(function() { node.done(); }, 30);
            }
            else {

                node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);

                window.scrollTo(0,0);

                node.env('auto', function() {
                    node.timer.randomExec(function() {
                        node.game.visualTimer.doTimeUp();
                    });
                });
                
                    
                    
                
                for (var i = 0; i < 3; i++) {
                    var questionnaireClassesId1 = 'choices' + i;
                    var questionnaireClasses1 = W.getElementById(questionnaireClassesId1);
                    questionnaireClasses1.onclick = function(i) {
                        var thisId = this.id;
                        var thisNumber = thisId.slice(-1);
                        var thisRadioId = 'choices_radio' + thisNumber;
                        var thisRadio = W.getElementById(thisRadioId);
                        thisRadio.checked = true;               
                    }
                }
                
                for (var i = 0; i < 3; i++) {
                    var questionnaireClassesId2 = 'intend' + i;
                    var questionnaireClasses2 = W.getElementById(questionnaireClassesId2);
                    questionnaireClasses2.onclick = function(i) {
                        var thisId = this.id;
                        var thisNumber = thisId.slice(-1);
                        var thisRadioId = 'intend_radio' + thisNumber;
                        var thisRadio = W.getElementById(thisRadioId);
                        thisRadio.checked = true;               
                    }
                }
                
                for (var i = 0; i < 2; i++) {
                    var questionnaireClassesId3 = 'depend' + i;
                    var questionnaireClasses3 = W.getElementById(questionnaireClassesId3);
                    questionnaireClasses3.onclick = function(i) {
                        var thisId = this.id;
                        var thisNumber = thisId.slice(-1);
                        var thisRadioId = 'depend_radio' + thisNumber;
                        var thisRadio = W.getElementById(thisRadioId);
                        thisRadio.checked = true;               
                    }
                }
                
                var b = W.getElementById('submit');
                
                b.onclick = function() {

                    for (var i = 0; i < 3; i++) {
                        var posname = 'choices_radio' + i;
                        var position = W.getElementById(posname);
                        if (position.checked) {
                            var choicesValue = position.value;
                            break;
                        }
                    }
                    
                    for (var i = 0; i < 3; i++) {
                        var posname2 = 'intend_radio' + i;
                        var position2 = W.getElementById(posname2);
                        if (position2.checked) {
                            var intendValue = position2.value;
                            break;
                        }
                    }
                    
                    for (var i = 0; i < 2; i++) {
                        var posname3 = 'depend_radio' + i;
                        var position3 = W.getElementById(posname3);
                        if (position3.checked) {
                            var dependValue = position3.value;
                            break;
                        }
                    }
                    
                    
                    var badAlert = W.getElementById('badAlert');
                    var goodAlert = W.getElementById('goodAlert');
                    
                    if (!choicesValue || !intendValue || !dependValue) {
                        badAlert.style.display = '';
                    } else {
                        badAlert.style.display = 'none';
                        goodAlert.style.display = '';
                        node.emit('QUEST1_DONE', choicesValue, intendValue, dependValue);
                    }    
                    
                }
                
                
                console.log('Postgame');
            }

        },
        timer: 120000,
        // `done` is a callback function that is executed as soon as a
        // _DONE_ event is emitted. It can perform clean-up operations (such
        // as disabling all the forms) and only if it returns true, the
        // client will enter the _DONE_ stage level, and the step rule
        // will be evaluated.
        done: function() {
            node.emit('INPUT_DISABLE');
            return true;
        }
    });

    stager.extendStep('questionnaire2', {
        frame: settings.postgame2Page,
        //frame: 'postgame2.html',
        cb: cbs.postgame2,
        timer: 120000,
        done: function() {
            node.emit('INPUT_DISABLE');
            return true;
        }
    });

    stager.extendStep('questionnaire3', {
        frame: settings.postgame3Page,
        //frame: 'postgame3.html',
        cb: cbs.postgame3,
        timer: 180000,
        done: function() {
            node.emit('INPUT_DISABLE');
            return true;
        }
    });

    // We serialize the game sequence before sending it.
    game.plot = stager.getState();

    // Other settings, optional.
   
    game.env = {
        auto: settings.AUTO,
        treatment: treatmentName
    };
    game.verbosity = 0;

    game.debug = settings.DEBUG;
    game.nodename = 'player';

    return game;
};
