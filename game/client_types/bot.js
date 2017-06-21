/**
 * # Bot code for Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Code for a bot playing the ultimatum game randomly.
 * 
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var game;

    var channel = gameRoom.channel;
    var node = gameRoom.node;



    // Import other functions used in the game.
    ///////////////////////////////////////////

    cbs = require(__dirname + '/includes/bot.callbacks.js');

    // Specify init function, and extend default stages.
    ////////////////////////////////////////////////////

    stager.setOnInit(cbs.init);

    // Set the default step rule for all the stages.
    stager.setDefaultStepRule(stepRules.WAIT);




    stager.extendStep('instructions', {
        cb: function() {
            var that = this;
            that.node.done();
        }
    });

    stager.extendStep('quiz', {
        cb: function() {
            var that = this;
            that.node.done();
        }
    });
    
    stager.extendStep('quiz2', {
        cb: function() {
            var that = this;
            that.node.done();
        }
    });

    stager.extendStep('decision', {
        cb: function() {
            var that = this;
            var randomValue = Math.floor((Math.random()*9));
            that.node.done({
                choice: randomValue,
                bot: true
            });
        }
    });

    stager.extendStep('feedback', {
        cb: function() {
            var that = this;
            that.node.done();
        }
    });






    /*stager.extendStep('ultimatum', {
        cb: cbs.ultimatum
    });*/

    // Prepare the game object to return.
    /////////////////////////////////////

    game = {};

    // We serialize the game sequence before sending it.
    game.plot = stager.getState();

    // Let's add the metadata information.
    game.metadata = {
        name: 'ultimatum_bot',
        version: '0.4.0',
        description: 'Bot randomly playing the ultimatum game'
    };

    // Other settings, optional.
    game.settings = {
        publishLevel: 2
    };

    game.env = {
        auto: settings.AUTO,
        treatment: treatmentName
    };

    game.verbosity = 0;
    game.debug = settings.DEBUG;
    game.nodename = 'bot';

    return game;
};
