module.exports = function(settings, headers) {
    // var coins = settings.pp.COINS;

    var receive = settings.receive;
    var send = settings.send;
    
    return {
        "title": "Feedback",
        "feedback": "Feedback",
        "choices1": "Your first choice:",
        "choices2": "Your second choice:",
        "choices3": "Your partners first choice:",
        "choices4": "Your partners second choices:",
        "youChose1": "First payoff: ",
        "youChose2": "Second payoff: ",
        "youReceivedAChoice1": "First payoff: ",
        "youReceivedAChoice2": "Second payoff: ",
        "submit": "Continue",
        
        "payoff": "Your total payoff in this round: ",
        "receive": receive,
        "send": send,
    };
};
