/**
 * # Game settings: Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {

    // Session Counter start from.
    SESSION_ID: 100,

    // Minimum number of players that must be always connected.
    MIN_PLAYERS: 2,

    // Number or rounds to repeat the bidding. *
    // REPEAT: 10,
    REPEAT: 2,          // For testing

    // Number of coins to split. *
    COINS: 100,

    // Divider COINS / DOLLARS *
    EXCHANGE_RATE: 4000,


    // Values
    receive1: [85, 87, 89, 91, 93, 94, 96, 98, 100],
    send1: [15, 19, 24, 28, 33, 37, 41, 46, 50],

    receive2: [100, 98, 96, 94, 93, 91, 89, 87, 85],
    send2: [50, 54, 59, 63, 68, 72, 76, 81, 85],
    
    EXCHANGE_RATE_INSTRUCTIONS: 0.01,

    // DEBUG.
    DEBUG: true,

    // AUTO-PLAY.
    AUTO: false,

    // AUTHORIZATION.
    AUTH: 'MTURK', // MTURK, LOCAL, NO.

    // Available treatments:
    // (there is also the "standard" treatment, using the options above)
    treatments: {
        
        standard: {
            fullName: "Standard",
            description:
                "No re-matching, feedback stage.",
            WAIT_TIME: 20
        },

        nf_: {                  // Added _ for testing
            fullName: "No Feedback",
            description:
                "No re-matching, no feedback stage.",
            WAIT_TIME: 20
        },
        
        /*

        rm: {
            fullName: "Re-Matching",
            description:
                "Re-matching, feedback stage.",
            WAIT_TIME: 60
        }
        */
    }

    // * =  If you change this, you need to update 
    // the instructions and quiz static files in public/
};
