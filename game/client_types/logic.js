/**
 * # Logic code for Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var J = ngc.JSUS;

// Variable registered outside of the export function
// are shared among all instances of game logics.
var counter = 0;

// Flag to not cache required files.
var nocache = true;

// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var channel = gameRoom.channel;
    var node = gameRoom.node;
    var dk = require('descil-mturk')();

    // Increment counter.
    counter = counter ? ++counter : settings.SESSION_ID;


    //delete require.cache[require.resolve(__dirname + '/includes/logic.callbacks.js')]

    // Import other functions used in the game.
    // Some objects are shared.
    var cbs = channel.require(__dirname + '/includes/logic.callbacks.js', {
        node: node,
        gameRoom: gameRoom,
        settings: settings,
        counter: counter
        // Reference to channel added by default.
    }, nocache);

    // Event handler registered in the init function are always valid.
    stager.setOnInit(cbs.init);

    // Event handler registered in the init function are always valid.
    stager.setOnGameOver(cbs.gameover);

    // Extending default stages.

    stager.setDefaultProperty('minPlayers', [
        settings.MIN_PLAYERS,
        cbs.notEnoughPlayers
    ]);

    stager.setDefaultCallback(function() {});

    stager.extendStep('selectLanguage', {
        cb: function() {
            // Storing the language setting.
            node.on.data('mylang', function(msg) {
                if (msg.data && msg.data.name !== 'English') {
                    channel.registry.updateClient(msg.from, { lang: msg.data });
                }
            });
        }
    });
      

    stager.extendStep('ultimatum1', {
        cb: function() {
            this.node.log('Ultimatum');
            cbs.doMatchPrev();
        }
    });
    
    stager.extendStep('feedback', {
        cb: function() {
            this.node.log('Feedback');
            cbs.feedback();
            cbs.doMatchNext();
        }
    });


    // Handling stepping and synchronization during questionnaire.

    stager.extendStage('final', {
        minPlayers: undefined,
        steprule: stepRules.WAIT,
        init: function() {
            node.on.data('totpayoff', function(msg) {
                cbs.totalpayoff(msg.from);
            });
            node.on.data('endgame', function(msg) {
                cbs.endgame(msg.from);
            });
            
            // Since we do not execute the normal STEPPING, we must seperately save data as well
            node.on.data('done', function(msg) {
                    
                var path = require('path');
                var db, prefix;
                var DUMP_DIR = path.resolve(channel.getGameDir(), 'data') + '/' + counter + '/';
                // var currentStage = node.game.getCurrentGameStage();
                var GameStage = ngc.GameStage;
                var currentStage = new GameStage(msg.stage);

                console.log(currentStage);
                // node.game.lastStage = currentStage;
                db = node.game.memory.stage[currentStage];

                if (db && db.size()) {
                    prefix = DUMP_DIR + 'memory_' + currentStage;
                    db.save(prefix + '.csv', { flags: 'w' }); 
                    db.save(prefix + '.nddb', { flags: 'w' });
                    console.log('Round data saved ', currentStage);
                }
            });
        }
    });

    stager.extendStep('totalpayoff', {
        cb: function() {
            this.node.log('Total Payoffs');
            // cbs.totalpayoff();
        },
        // minPlayers: undefined,
        // syncStepping: false,
    });

    stager.extendStep('questionnaire1', {
        // stepRule: stepRules.SOLO,
        // minPlayers: undefined,
        // syncStepping: false,
        cb: function() {
            console.log('AAAA - 1');
//             debugger
//             node.done();
        }
    });

    stager.extendStep('questionnaire2', {
        minPlayers: undefined,
        // stepRule: stepRules.SOLO,
        // syncStepping: false,
        cb: function() { 
            console.log('AAAA - 2');
//          node.done();
        }
    });

    stager.extendStep('questionnaire3', {
        // minPlayers: undefined,
        // syncStepping: false,
        cb: function() {
            console.log('AAAA - 3');
        //    node.done(); 
        }
    });

    stager.extendStep('endgame', {
        cb: function() {
            postPayoffs({AccessCode: 394034, Bonus: 0.15, BonusReason: 'FullBonus'});
            cb: cbs.endgame
        }
//        minPlayers: undefined,
//        steprule: stepRules.SOLO
    });


    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc' + counter,
        // Extracts, and compacts the game plot that we defined above.
        plot: stager.getState(),
        // If debug is false (default false), exception will be caught and
        // and printed to screen, and the game will continue.
        debug: settings.DEBUG,
        // Controls the amount of information printed to screen.
        verbosity: 0,
        // nodeGame enviroment variables.
        env: {
            auto: settings.AUTO
        }
    };
    
    // Helper functions
    function postPayoffs(payoffs) {
        dk.postPayoffs(payoffs, function(err, response, body) {
            if (err) {
                node.err("adjustPayoffAndCheckout: " +
                         "dk.postPayoff: " + err);
            };
        });
    }

};
