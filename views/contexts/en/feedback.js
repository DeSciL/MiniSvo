module.exports = function(settings, headers) {
    var coins = settings.pp.COINS;

    return {
        "title": "Feedback",
        "feedback": "Feedback",
        "choices1": "Your choices:",
        "choices2": "Your partners choices:",
        "youChose1": "First payoff: ",
        "youChose2": "Second payoff: ",
        "youReceivedAnOffer1": "First payoff: ",
        "youReceivedAnOffer2": "Second payoff: ",
        "submit": "Continue",
        
        "payoff": "Your total payoff in this round: "
    };
};
