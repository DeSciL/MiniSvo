/**
 * # Functions used by the client of MiniSvo Game
 */

var ngc = require('nodegame-client');
var GameStage = ngc.GameStage;
var J = ngc.JSUS;
var path = require('path');
var fs = require('fs-extra');

var DUMP_DIR, DUMP_DIR_JSON, DUMP_DIR_CSV;

module.exports = {
    init: init,
    gameover: gameover,
    endgame: endgame,
    feedback: feedback,
    totalpayoff: totalpayoff,
    notEnoughPlayers: notEnoughPlayers
};

var node = module.parent.exports.node;
var channel = module.parent.exports.channel;
var gameRoom = module.parent.exports.gameRoom;
var settings = module.parent.exports.settings;
var counter = module.parent.exports.counter;


var client = gameRoom.getClientType('player');
var autoplay = gameRoom.getClientType('autoplay');


function init() {
    DUMP_DIR = path.resolve(channel.getGameDir(), 'data') + '/' + counter + '/';
    
//     DUMP_DIR_JSON = DUMP_DIR + 'json/';
//     DUMP_DIR_CSV = DUMP_DIR + 'csv/';
// 
//     // Recursively create directories, sub-trees and all.
//     J.mkdirSyncRecursive(DUMP_DIR_JSON, 0777);
//     J.mkdirSyncRecursive(DUMP_DIR_CSV, 0777);

 //   J.mkdirSyncRecursive(DUMP_DIR, 0777);
    fs.mkdirsSync(DUMP_DIR);

    console.log('********************** minisvo room ' + counter++ +
                ' **********************');

    var COINS = settings.COINS;

    node.game.lastStage = node.game.getCurrentGameStage();

    node.game.gameTerminated = false;
    
    node.game.disconnectStr = 'One or more players disconnected. If they ' +
        'do not reconnect within ' + settings.WAIT_TIME  +
        ' seconds the game will be terminated.';

    // Bonus
    
    node.game.bonuses = [];
    

    // If players disconnects and then re-connects within the same round
    // we need to take into account only the final bids within that round.
    node.game.lastBids = {};

    // "STEPPING" is the last event emitted before the stage is updated.
    node.on('STEPPING', function() {
        var currentStage, db, prefix;

        currentStage = node.game.getCurrentGameStage();

        // We do not save stage 0.0.0.
        // Morever, If the last stage is equal to the current one, we are
        // re-playing the same stage cause of a reconnection. In this
        // case we do not update the database, or save files.
        if (!GameStage.compare(currentStage, new GameStage())) {// ||
            //!GameStage.compare(currentStage, node.game.lastStage)) {
            return;
        }
        // Update last stage reference.
        node.game.lastStage = currentStage;

        db = node.game.memory.stage[currentStage];

        if (db && db.size()) {
            // Saving results to FS.
            // node.fs.saveMemory('csv', DUMP_DIR + 'memory_' + currentStage +
            //                   '.csv', { flags: 'w' }, db);
            // node.fs.saveMemory('json', DUMP_DIR + 'memory_' + currentStage +
            //                   '.nddb', null, db);

            prefix = DUMP_DIR + 'memory_' + currentStage;
            db.save(prefix + '.csv', { flags: 'w' }); 
            db.save(prefix + '.nddb', { flags: 'w' }); 

            console.log('Round data saved ', currentStage);
        }
        
        /*
        // Resets last bids;
        node.game.lastBids = {};
        */    
    });

    // Add session name to data in DB.
    node.game.memory.on('insert', function(o) {
        o.session = node.nodename;
    });

    // Register player disconnection, and wait for him...
    /*node.on.pdisconnect(function(p) {
        console.log('Disconnection in Stage: ' + node.player.stage);
    });*/

    node.on.pdisconnect(function(player) {
            // TEST:
            player.allowReconnect = false; // check if registry maybe

            console.log('Connecting bot to room: ' + gameRoom.name + '. Stage: ' + node.player.stage + '. Player ID: ' + player.id);
            channel.connectBot({
                room: gameRoom,
                clientType: 'bot',
                replaceId: player.id,
                gotoStep: node.player.stage,
            });
        });


    // Player reconnecting.
    // Reconnections must be handled by the game developer.
    node.on.preconnect(function(p) {
        var code;

        console.log('Oh...somebody reconnected!', p);
        code = channel.registry.getClient(p.id);

        // Delete countdown to terminate the game.
        clearTimeout(this.countdown);

        // Clear any message in the buffer from.
        node.remoteCommand('erase_buffer', 'ROOM');

        if (code.lang.name !== 'English') {
            // If lang is different from Eng, remote setup it.
            // TRUE: sets also the URI prefix.
            console.log('CODE LANG SENT');
            node.remoteSetup('lang', p.id, [code.lang, true]);
        }
        
        // Setup newly connected client.
        gameRoom.setupClient(p.id);
        node.remoteSetup('env', p.id, {reload: true});

        // Start the game on the reconnecting client.
        // Need to give step: false, because otherwise pre-caching will
        // call done() on reconnecting stage.
        node.remoteCommand('start', p.id, { step: false } );

        // Pause the game on the reconnecting client, will be resumed later.
        // node.remoteCommand('pause', p.id);

        // It is not added automatically.
        // TODO: add it automatically if we return TRUE? It must be done
        // both in the alias and the real event handler.
        node.game.pl.add(p);

        // Will send all the players to current stage
        // (also those who were there already).
        node.game.gotoStep(node.player.stage);

        setTimeout(function() {
            // Pause the game on the reconnecting client, will be resumed later.
            // node.remoteCommand('pause', p.id);
            // Unpause ALL players
            // TODO: add it automatically if we return TRUE? It must be done
            // both in the alias and the real event handler
            node.game.pl.each(function(player) {
                if (player.id !== p.id) {
                    node.remoteCommand('resume', player.id);
                }
            });
            // The logic is also reset to the same game stage.
        }, 100);
        // Unpause ALL players
        // node.remoteCommand('resume', 'ALL');
    });

    /*

    // Update the Payoffs
    node.on.data('response', function(msg) {
        var resWin, bidWin, code, response;
        response = msg.data;

        if (response.response === 'ACCEPT') {
            resWin = parseInt(response.value, 10);
            bidWin = COINS - resWin;

            // Save the results in a temporary variables. If the round
            // finishes without a disconnection we will add them to the
            // database.
            node.game.lastBids[msg.from] = resWin;
            node.game.lastBids[response.from] = bidWin;
        }
    });
    
    */

    console.log('init');
}

function feedback() {

    var treatment = settings.treatmentName;
    var previousStage; 
    previousStage = node.game.plot.previous(node.game.getCurrentGameStage());

    //FEEDBACK OF NEXT PARTNER
    if(treatment == 'standard') {
        var round = node.player.stage.round;
        var nextRound = parseInt(round) + 1;
        var matches = node.game.matcher.getMatches("ARRAY", nextRound)

        for (var j = 0; j < matches.length; j++) {
            var player1 = matches[j][0];
            var other1 = matches[j][1];
            var otherChoiceItem1 = node.game.memory.stage[previousStage].select('player', '=', other1).first();

            if (otherChoiceItem1) {
                var bot1 = otherChoiceItem1.bot;
                var timeup1 = otherChoiceItem1.timeup;
                var botSameRound1 = false;
                var otherChoice1 =  otherChoiceItem1.choice;
                node.say('OTHER_CHOICE', player1,  {choice: otherChoice1, timeup: timeup1, bot: bot1, botSameRound: botSameRound1});
            }
            else { node.say('OTHER_CHOICE', player1,  {choice: 10, timeup: true, bot: false, botSameRound: true});}


            var player2 = matches[j][1];
            var other2 = matches[j][0];
            var otherChoiceItem2 = node.game.memory.stage[previousStage].select('player', '=', other2).first();

            if (otherChoiceItem2) {
                var bot2 = otherChoiceItem2.bot;
                var timeup2 = otherChoiceItem2.timeup;
                var botSameRound2 = false;
                var otherChoice2=  otherChoiceItem2.choice;
                node.say('OTHER_CHOICE', player2,  {choice: otherChoice2, timeup: timeup2, bot: bot2, botSameRound: botSameRound2});
            }
            else { node.say('OTHER_CHOICE', player2,  {choice: 10, timeup: true, bot: false, botSameRound: true}); }
        }
    }


    // FEEDBACK SAME ROUND
    else if(treatment =='previous' || treatment =='none') {
        node.game.memory.stage[previousStage].each(function(item) {

            var other = item.other;
            
            if (other) {
                var otherChoiceItem = node.game.memory.stage[previousStage].select('player', '=', other).first();
                
                if (otherChoiceItem) {
                    var bot = otherChoiceItem.bot;
                    var timeup = otherChoiceItem.timeup;
                    var botSameRound = false;
                    var otherChoice =  otherChoiceItem.choice;
                }
                else {
                    var bot = false;
                    var botSameRound = true;
                    var timeup = true;
                    var otherChoice =  10;
                }

                node.say('OTHER_CHOICE', item.player,  {choice: otherChoice, timeup: timeup, bot: bot, botSameRound: botSameRound});
            } else {
                
                node.say('ERROR_CHOICE', item.player);  
            }
        });
    }
}


function totalpayoff(playerId) {
    var i, len, round, other, otherChoice;
    var out;

    console.log('TOTALPAYOFFSS!');

    if (!node.game.pl.id.get(playerId)) {
        console.log('Noooooot f', playerId);
        return;
    }

    var payoffs = node.game.memory.player[playerId].select('choice').fetch();
    i = -1, len = payoffs.length;
    out = new Array(len);
    for ( ; ++i < len ; ) {
        other = payoffs[i].other;
        round = payoffs[i].stage.round;
        timeup = payoffs[i].timeup;
        other = node.game.memory.player[other]
            .select('choice')
            .and('stage.round', '=', round)
            .last();


        if (!other) {
            console.log('other not found, put def value');
            //otherChoice1 = 1;
            otherChoice = 1;
        }
        else {
            //otherChoice1 = other.choice1;
            otherChoice = other.choice;
        }

        out[i] = {
            myChoice: payoffs[i].choice,
            otherChoice: otherChoice,
            timeup: timeup
        };
    }


    node.say('PAYOFFS', playerId, out);
}


function gameover() {
    console.log('************** GAMEOVER ' + gameRoom.name + ' ****************');

    // Saving all indexes.
    // node.fs.saveMemoryIndexes('csv', DUMP_DIR_CSV);
    // node.fs.saveMemoryIndexes('json', DUMP_DIR_JSON);

    // Dump all memory.
    // node.fs.saveMemory('json', DUMP_DIR + 'memory_all.json');
    node.game.memory.save(DUMP_DIR + 'memory_all.json');

    // TODO: fix this.
    // channel.destroyGameRoom(gameRoom.name);
}

function doMatchPrev() {
    var g, i, bidder, respondent, data_b, data_r;

    if (node.game.pl.size() < 2) {
        if (!this.countdown) notEnoughPlayers();
        return;
    }
    var treatment = settings.treatmentName;
    //treatment = 'standard';
    
    
    var round = node.player.stage.round; // or another counter
    
    
    if ((treatment == 'rmNext' && round == 1) || treatment == 'standard' || treatment == 'rmNf') { // TREATMENT HACK
        
        
        // ROUNDROBIN RE-MATCHING
        // Set number of players in game.settings
        // Number of rounds must make sense in combination with numbers of players
        // Is executed here so you see the feedback of your partner in this round (Previous), plus for no feedback
        // Run this once in first round for rmNext treatment because we need a match!
        
        var matches = node.game.matcher.getMatch(round); 
        var item;

        for (var j = 0; j < matches.length; j++) {
            
            data_b = {
                //role: 'bidder',
                other: matches[i][1]
            };
            data_r = {
                //role: 'respondent',
                other: matches[i][0]
            };
            
            node.say('BIDDER', matches[i][0], data_b);
            node.say('BIDDER', matches[i][1], data_r);
        }
        console.log('Re-Matching completed.');
    } else if (/*treatment == 'standard' || */treatment == 'nf'){

        // RANDOM RE-MATCHING
        // Method shuffle accepts one parameter to update the db, as well as
        // returning a shuffled copy.
        
        g = node.game.pl.shuffle();

        for (i = 0 ; i < node.game.pl.size() ; i = i + 2) {
            bidder = g.db[i];
            respondent = g.db[i+1];

            data_b = {
                //role: 'bidder',
                other: respondent.id
            };
            data_r = {
                //role: 'respondent',
                other: bidder.id
            };

            console.log('Group ' + i + ': ', bidder.id, respondent.id);

            // Send a message to each player with their role
            // and the id of the other player.
            console.log('==================== LOGIC: BIDDER is', bidder.id, 
                        '; RESPONDENT IS', respondent.id);
        
            console.log(node.game.pl.size());
            console.log(node.nodename);

            node.say('BIDDER', bidder.id, data_b);
            node.say('BIDDER', respondent.id, data_r);
            //node.say('RESPONDENT', respondent.id, data_r);
        }
        console.log('Matching completed.');
    }
}

function notEnoughPlayers() {
    // if (this.countdown) return;
    console.log('Warning: not enough players!!');
    var disconnectionStage = node.game.lastStage.stage;
    // console.log(disconnectionStage);
    // Pause connected players.
    node.remoteCommand('pause', 'ROOM', this.disconnectStr);

    // only redirect if they are BEFORE final stage
  

    this.countdown = setTimeout(function() {
        console.log('Countdown fired. Going to Step: totalpayoff.');
        node.remoteCommand('erase_buffer', 'ROOM');
        node.remoteCommand('resume', 'ROOM');
        node.game.gameTerminated = true;
        // if syncStepping = false
        //node.remoteCommand('goto_step', 5);
        // Step must be not-skipped if you give the id (else give a number).

        // Only push to final stage if final stage has not been reached yet
        if (disconnectionStage < 6) {
            node.game.gotoStep(new GameStage('final'));
        }
    }, settings.WAIT_TIME * 1000);

}

// remember to export it.
function enoughPlayersAgain() {
    // Delete countdown to terminate the game.
    clearTimeout(this.countdown);
}


function endgame(playerId) {
    var code, exitcode, accesscode;
    var filename, bonusFile, bonus;
    var EXCHANGE_RATE;

    EXCHANGE_RATE = settings.EXCHANGE_RATE_INSTRUCTIONS / settings.COINS;

    var p = {id: playerId};

    code = channel.registry.getClient(p.id);
    if (!code) {
        console.log('ERROR: no code in endgame:', p.id);
        return ['NA', 'NA'];
    }

    accesscode = code.AccessCode;
    exitcode = code.ExitCode;

    if (node.env('treatment') === 'pp' && node.game.gameTerminated) {
        //code.win = 0;
    }
    else {
        bonus = node.game.memory.player[playerId].select('bonus').fetch();
        code.win = bonus[0].bonus;
        
        //code.win = Number((code.win || 0) * (EXCHANGE_RATE)).toFixed(2);
        //code.win = parseFloat(code.win, 10);
    }
    channel.registry.checkOut(p.id);

    node.say('WIN', p.id, {
        win: code.win,
        exitcode: code.ExitCode
    });

    console.log(p.id, ': ',  code.win, code.ExitCode);


    node.game.bonuses.push([p.id, code.ExitCode || 'na', code.win,
                            node.game.gameTerminated]);

    
    

    // Not very strong condition. Might need improvement.
    // if (node.game.bonuses.length === node.game.pl.size()) {

    // Write down bonus file.
    filename = DUMP_DIR + 'bonus.csv';
    bonusFile = fs.createWriteStream(filename);
    bonusFile.on('error', function(err) {
        console.log('Error while saving bonus file: ', err);
    });
    bonusFile.write(["access", "exit", "bonus", "terminated"].join(', ') + '\n');
    node.game.bonuses.forEach(function(v) {
        bonusFile.write(v.join(', ') + '\n'); 
    });
    bonusFile.end();

    // node.fs.writeCsv(bonusFile, bonus, {
    //     headers: ["access", "exit", "bonus", "terminated"]
    // });

    node.game.memory.save(DUMP_DIR + 'memory_all.json');

        // node.done();
    // }
}