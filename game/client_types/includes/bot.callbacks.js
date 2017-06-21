/**
 * # Functions used by the bot of Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {

    init: init,
    choices: choices,

};

function init() {
    var that, node;
    
    that = this;
    node = this.node;

    this.other = null;

    node.on('BID_DONE', function(choice, to) {
        node.game.lastChoice = choice;
        node.say('CHOICE', to, {choice: choice});
        node.done({
            choice: randomValue,
            bot: true
        });
    });
}

function choices() {
    var that, node;
    
    that = this;
    node = this.node;
    var other = node.game.partner;
    node.game.other = other;
    var randomValue = Math.floor((Math.random()*9));
    node.emit('BID_DONE', randomValue, other)
}