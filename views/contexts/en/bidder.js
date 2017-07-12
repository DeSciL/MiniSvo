module.exports = function(settings, headers) {
    // var coins = settings.pp.COINS;
    
    
    var receive1 = settings.receive1;
    var send1 = settings.send1;
    var receive2 = settings.receive2;
    var send2 = settings.send2;

    return {
        "title": "Allocations",
        "youAre": "Choices",
        "makeAChoice1": "Choose one of the following allocations:",
        "makeAChoice2": "Choose one of the following allocations:",
        "submit": "Submit",
        "receive1": receive1,
        "send1": send1,
        "receive2": receive2,
        "send2": send2
    };
};
 