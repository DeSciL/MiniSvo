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

    // Minimum number of players that must be always connected. LIVE: 20
    MIN_PLAYERS: 20,

    // Number or rounds to repeat the bidding. LIVE: 10
    REPEAT: 10,

    // Divider COINS / DOLLARS *
    EXCHANGE_RATE: 2000,

    // Values
    receive: [100, 98, 96, 94, 93, 91, 89, 87, 85],
    send: [50, 54, 59, 63, 68, 72, 76, 81, 85],

    // Second Item
    // receive1: [85, 87, 89, 91, 93, 94, 96, 98, 100],
    // send1: [15, 19, 24, 28, 33, 37, 41, 46, 50],
    
    // DEBUG.
    DEBUG: false,
    // DEBUG: true,             // Testing

    // AUTO-PLAY.
    AUTO: false,

    // AUTHORIZATION.
    AUTH: 'MTURK', // MTURK, LOCAL, NO.

    // TREATMENTS.
    treatments: {
       
        // FIRST TWO: PARTNER MATCHING
        /*standard: {
            fullName: "Standard",
            description:
                "Partner, feedback.",
            WAIT_TIME: 20
        },

        nf: { 
            fullName: "No Feedback",
            description:
                "Partner, no feedback.",
            WAIT_TIME: 20
        },*/
        
        // LAST THREE: RE-MATCHING
        standard: {
            fullName: "Re-Matching Next feedback",
            description:
                "Stranger re-matching, feedback for next partner.",
            WAIT_TIME: 20,
            instructionsPage: 'instructions_next.html',
            feedbackPage: 'feedback_next.html',
            postgamePage: 'postgame_next.html',
            postgame2Page: 'postgame2_next.html',
            postgame3Page: 'postgame3_next.html'
        },
        

        previous: {
            fullName: "Re-Matching Previous Feedback",
            description:
                "Stranger re-matching, feedback for previous partner.",
            WAIT_TIME: 20,
            instructionsPage: 'instructions_previous.html',
            feedbackPage: 'feedback_previous.html',
            postgamePage: 'postgame_previous.html',
            postgame2Page: 'postgame2_previous.html',
            postgame3Page: 'postgame3_previous.html'
        },

        
        none: {
            fullName: "Re-Matching No Feedback",
            description:
                "Stranger re-matching, no feedback.",
            WAIT_TIME: 20,
            instructionsPage: 'instructions_none.html',
            feedbackPage: 'feedback_none.html',
            postgamePage: 'postgame_next.html',
            postgame2Page: 'postgame2_none.html',
            postgame3Page: 'postgame3_none.html'
        }
        
    }
};
