module.exports = function(settings, headers) {
    var coins = settings.pp.COINS;
    
    
    var receive1 = settings.pp.receive1;
    var send1 = settings.pp.send1;
    var receive2 = settings.pp.receive2;
    var send2 = settings.pp.send2;

    return {
        "title": "Allocations",
        "youAre": "Allocations",
        "makeAnOffer1": "Choose one of the following allocations:",
        "makeAnOffer2": "Choose one of the following allocations:",
        "submit": "Submit",
        "receive1": receive1,
        "send1": send1,
        "receive2": receive2,
        "send2": send2
    };
};
