module.exports = function(settings, headers) {
    var coins = settings.pp.COINS;

    var receive1 = settings.pp.receive1;
    var send1 = settings.pp.send1;
    var receive2 = settings.pp.receive2;
    var send2 = settings.pp.send2;

    return {
        "title": "Feedback",
        "feedback": "Feedback",
        "choices1": "Your first choice:",
        "choices2": "Your second choice:",
        "choices3": "Your partners first choice:",
        "choices4": "Your partners second choices:",
        "youChose1": "First payoff: ",
        "youChose2": "Second payoff: ",
        "youReceivedAnOffer1": "First payoff: ",
        "youReceivedAnOffer2": "Second payoff: ",
        "submit": "Continue",
        
        "payoff": "Your total payoff in this round: ",
        "receive1": receive1,
        "send1": send1,
        "receive2": receive2,
        "send2": send2
    };
};
