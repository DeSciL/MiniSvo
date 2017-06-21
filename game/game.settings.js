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
    MIN_PLAYERS: 20,

    // Number or rounds to repeat the bidding. *
    REPEAT: 10,

    // Number of coins to split. *
    COINS: 100,

    // Divider COINS / DOLLARS *
    EXCHANGE_RATE: 2000,


    // Values
    receive: [100, 98, 96, 94, 93, 91, 89, 87, 85],
    send: [50, 54, 59, 63, 68, 72, 76, 81, 85],

    // Second Item
    // receive1: [85, 87, 89, 91, 93, 94, 96, 98, 100],
    // send1: [15, 19, 24, 28, 33, 37, 41, 46, 50],
    
    EXCHANGE_RATE_INSTRUCTIONS: 0.01,

    // DEBUG.
    DEBUG: false,
    // DEBUG: true,             // Testing

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
                "Partner, feedback.",
            WAIT_TIME: 20
        },

        /*nf: { 
            fullName: "No Feedback",
            description:
                "Partner, no feedback.",
            WAIT_TIME: 20
        },*/
        
        /*
        rmNf: {
            fullName: "Re-Matching No Feedback",
            description:
                "Stranger re-matching, no feedback.",
            WAIT_TIME: 20
        }*/
        
        /*rmPrev: {
            fullName: "Re-Matching Previous FeedbackNext feedback",
            description:
                "Stranger re-matching, feedback for previous partner.",
            WAIT_TIME: 20
        }*/
        
        /*rmNext: {
            fullName: "Re-Matching Next feedback",
            description:
                "Stranger re-matching, feedback for next partner.",
            WAIT_TIME: 20
        }
        */
    }

    // * =  If you change this, you need to update 
    // the instructions and quiz static files in public/
};
