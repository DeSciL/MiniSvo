module.exports = function(settings, headers) {
    // var coins = settings.pp.COINS;
    
    
    var receive = settings.receive;
    var send = settings.send;

    return {
        "title": "Allocations",
        "youAre": "Choices",
        "makeAChoice1": "Choose one of the following allocations:",
        "makeAChoice2": "Choose one of the following allocations:",
        "submit": "Submit",
        "receive": receive,
        "send": send,
    };
};
 