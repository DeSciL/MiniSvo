module.exports = function(settings, headers) {
    
    var receive1 = settings.nf.receive1;
    var send1 = settings.nf.send1;
    var receive2 = settings.nf.receive2;
    var send2 = settings.nf.send2;

    /*var C = settings.pp.COINS;
    var R = settings.pp.REPEAT;
    var E = settings.pp.EXCHANGE_RATE_INSTRUCTIONS;

    var B = (C*R) * (E/C);*/

    return {
        title: "INSTRUCTIONS",
        "receive1": receive1,
        "send1": send1,
        "receive2": receive2,
        "send2": send2
        /*
        instructions: "Instructions of the Ultimatum Game. Please read them carefully.",
        thisGame: "This game is played in rounds by two human players randomly paired.",
        inEachRound: 'In each round, one of the them, called <em>BIDDER</em>, makes an offer to the other player, called <em>RESPONDENT</em>, about how to share ' + C + ' ECU (Experimental Currency). ' + C + ' ECU are equal to ' + E + ' USD.',
        theRespondent: "The RESPONDENT can either accept or reject the offer of the BIDDER. If he / she accepts, both players split " + C + " ECU accordingly, else both get 0.",
        theGame: "The game is repeated " + R + " rounds, therefore the maximum bonus available is " + B + " dollar/s.",
        ifYouUnderstood: "If you understood the instructions correctly press the button to proceed to the game.",
        proceed: "Proceed to the game"
        */
    };
};
