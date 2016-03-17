/**
 * # Functions used by the client of Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    init: init,
    precache: precache,
    selectLanguage: selectLanguage,
    instructions: instructions,
    quiz: quiz,
    ultimatum: ultimatum,
    feedback: feedback,
    totalpayoff: totalpayoff,
    postgame: postgame,
    endgame: endgame,
    clearFrame: clearFrame,
    notEnoughPlayers: notEnoughPlayers
};



function init() {
    var that, waitingForPlayers, treatment, header;

    that = this;
    this.node.log('Init.');

    // Setup the header (by default on the left side).
    if (!W.getHeader()) {
        header = W.generateHeader();

        // Uncomment to visualize the name of the stages.
        //node.game.visualStage = node.widgets.append('VisualStage', header);

        node.game.rounds = node.widgets.append('VisualRound', header, {
            displayModeNames: ['COUNT_UP_STAGES_TO_TOTAL'],
            stageOffset: 1
        });

        node.game.timer = node.widgets.append('VisualTimer', header);
    
        W.setHeaderPosition('top');
    }

    // Add the main frame where the pages will be loaded.
    if (!W.getFrame()) {
        W.generateFrame();
    }

    // Add default CSS.
    if (node.conf.host) {
        W.addCSS(W.getFrameRoot(), node.conf.host +
                 'stylesheets/nodegame.css');
    }

    // Add event listeners valid for the whole game.

    node.on('BID_DONE', function(offer1, offer2, to, timeup) {
        var root, time;

        // Time to make a bid.
        time = node.timer.getTimeSince('bidder_loaded');
        
        // Hack. To avoid double offers. Todo: fix.
        if (node.game.offerDone) return;
        node.game.offerDone = true;

        node.game.timer.clear();
        node.game.timer.startWaiting({milliseconds: 30000});

        W.getElementById('submitOffer').disabled = 'disabled';
        
        //save choices for feedback step
        node.game.lastOffer1 = offer1;
        node.game.lastOffer2 = offer2;
        
        // Notify the other player.
        node.say('OFFER', to, {offer1: offer1, offer2: offer2});

        root = W.getElementById('container');
        // Leave a space.
        //W.writeln(' Choice Allocation 1: ' +  offer1 + '. Choice Allocation 2: ' + offer2 +
        //          '. Waiting for the respondent... ', root);
                  
        // Notify the server.
        node.done({
            offer1: offer1,
            offer2: offer2,
            time: time,
            timeup: timeup,
            other: node.game.other
        });
    });

    node.on('FEEDBACK_DONE', function() {
        

        //////////////////////////////////////////////
        // nodeGame hint:
        //
        // node.done() communicates to the server that
        // the player has completed the current state.
        //
        // The parameters are send to the server with
        // a SET message. This SET message has two
        // properties by default:
        //
        // - time: time passed since the begin of the step
        // - timeup: if a timeup happened
        //
        // which can be overwritten by the parameter.
        //
        /////////////////////////////////////////////
        node.done();
    });


    // Clean up stage upon stepping into the next one.
    node.on('STEPPING', function() {
        W.clearFrame();
    });

    // Add other functions are variables used during the game.

    this.other = null;

    this.randomAccept = function(offer, other) {
        var root, accepted;
        accepted = Math.round(Math.random());
        console.log('randomaccept');
        console.log(offer + ' ' + other);
        root = W.getElementById('container');
        if (accepted) {
            node.emit('RESPONSE_DONE', 'ACCEPT', offer, other);
            W.write(' You accepted the offer.', root);
        }
        else {
            node.emit('RESPONSE_DONE', 'REJECT', offer, other);
            W.write(' You rejected the offer.', root);
        }
    };

    this.isValidBid = function(n) {
        if (typeof n !== 'string') return false;

        if (!/^\d+$/.test(n)) return false;

        n = parseInt(n, 10);
        return n >= 0 && n <= 100;
    };

    treatment = node.env('treatment');

    // Adapting the game to the treatment.
    if (treatment === 'pp') {
        node.game.instructionsPage = 'instructions_pp.html';
    }
    else {
        node.game.instructionsPage = 'instructions.html';
    }

    // Set default language prefix.
    W.setUriPrefix(node.player.lang.path);
}

//////////////////////////////////////////////
// nodeGame hint:
//
// Pages can be preloaded with this method:
//
// W.preCache()
//
// It loads the content from the URIs given in an array parameter, and the
// next time W.loadFrame() is used with those pages, they can be loaded
// from memory.
//
// W.preCache calls the function given as the second parameter when it's
// done.
//
/////////////////////////////////////////////
function precache() {
    W.lockScreen('Loading...');
    console.log('pre-caching...');
    W.preCache([
        'languageSelection.html', // no text here.
        node.game.instructionsPage,
        'quiz.html',

        // These two are cached later by loadFrame calls (for demonstration):
        // 'langPath + 'bidder.html',
        // 'langPath + 'resp.html',

        'postgame.html',
        'ended.html'
    ], function() {
        console.log('Precache done.');
        // Pre-Caching done; proceed to the next stage.
        node.done();
    });
}

function selectLanguage() {
    W.loadFrame('languageSelection.html', function() {
        var b = W.getElement('input', 'done', {
            type: "button", value: "Choice Made",
            className: "btn btn-lg btn-primary"
        });

        node.game.lang = node.widgets.append('LanguageSelector',
                                             W.getFrameDocument().body);

        W.getFrameDocument().body.appendChild(b);
        b.onclick = function() {
            node.done();
        };

        node.env('auto', function() {
            node.timer.randomExec(function() {
                b.click();
            });
        });
    });
}

function instructions() {
    var that = this;
    var count = 0;

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // The W object takes care of all
    // visual operation of the game. E.g.,
    //
    // W.loadFrame()
    //
    // loads an HTML file into the game screen,
    // and the execute the callback function
    // passed as second parameter.
    //
    /////////////////////////////////////////////
    W.loadFrame(node.game.instructionsPage, function() {

        var b = W.getElementById('read');
        b.onclick = function() {
            node.done();
        };

        ////////////////////////////////////////////////
        // nodeGame hint:
        //
        // node.env executes a function conditionally to
        // the environments defined in the configuration
        // options.
        //
        // If the 'auto' environment was set to TRUE,
        // then the function will be executed
        //
        ////////////////////////////////////////////////
        node.env('auto', function() {

            //////////////////////////////////////////////
            // nodeGame hint:
            //
            // Execute a function randomly in a time interval
            // from 0 to 2000 milliseconds
            //
            //////////////////////////////////////////////
            node.timer.randomExec(function() {
                node.done();
            }, 2000);
        });
    });
    console.log('Instructions');
}

function quiz() {
    var that = this;
    W.loadFrame('quiz.html', function() {

        var b, QUIZ;
        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.timer.doTimeUp();
            });
        });
    });
    console.log('Quiz');
}

function ultimatum() {

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // var that = this;
    //
    // /this/ is usually a reference to node.game
    //
    // However, unlike in many progamming languages,
    // in javascript the object /this/ assumes
    // different values depending on the scope
    // of the function where it is called.
    //
    /////////////////////////////////////////////
    var that = this;

    var root, b, options, other;

    node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL',
                                     'COUNT_UP_ROUNDS_TO_TOTAL']);


    // Hack to avoid double offers. Todo: fix.
    node.game.offerDone = false;

    // Load the BIDDER interface.
    node.on.data('BIDDER', function(msg) {
        console.log('RECEIVED BIDDER!');
        other = msg.data.other;
        node.game.other = msg.data.other;
        //node.set({role: 'BIDDER'});

        //////////////////////////////////////////////
        // nodeGame hint:
        //
        // W.loadFrame takes an optional third 'options' argument which
        // can be used to request caching of the displayed frames (see
        // the end of the following function call). The caching mode
        // can be set with two fields: 'loadMode' and 'storeMode'.
        //
        // 'loadMode' specifies whether the frame should be reloaded
        // regardless of caching (loadMode = 'reload') or whether the
        // frame should be looked up in the cache (loadMode = 'cache',
        // default).  If the frame is not in the cache, it is always
        // loaded from the server.
        //
        // 'storeMode' says when, if at all, to store the loaded frame.
        // By default the cache isn't updated (storeMode = 'off'). The
        // other options are to cache the frame right after it has been
        // loaded (storeMode = 'onLoad') and to cache it when it is
        // closed, that is, when the frame is replaced by other
        // contents (storeMode = 'onClose'). This last mode preserves
        // all the changes done while the frame was open.
        //
        /////////////////////////////////////////////
        W.loadFrame('bidder.html', function() {
            // Start the timer after an offer was received.
            options = {
                milliseconds: 30000,
                /*timeup: function() {
                    node.emit('BID_DONE',
                              Math.floor(Math.random() * 101), other, true);
                }*/
            };

            node.game.timer.startTiming(options);

            b = W.getElementById('submitOffer');

            /*node.env('auto', function() {

                //////////////////////////////////////////////
                // nodeGame hint:
                //
                // Execute a function randomly
                // in a time interval between 0 and 1 second
                //
                // NOTE: CHANGE THIS TO RANDOMLY SELECT TWO ALLOCATIONS
                //
                //////////////////////////////////////////////
                node.timer.randomExec(function() {
                    node.emit('BID_DONE',
                              Math.floor(Math.random() * 101), other);
                }, 4000);
            });*/

      
            var highlightClass1;
            var highlightClass2;
            
            
            for (var i = 0; i < 9; i++) {
                var hoverClassesNames = 'firstHoverclass' + i;
                var hoverClasses = W.getElementsByClassName(hoverClassesNames);
                for (var j = 0; j < hoverClasses.length; j++) {
                    hoverClasses[j].onmouseover = function() {
                        var thisClassName = this.className;                       
                        var thisClass = W.getElementsByClassName(thisClassName);
                        var thisNumber = thisClassName.slice(-1);
                        var thisRadioId = 'firstPos' + thisNumber;
                        var thisRadioButton = W.getElementById(thisRadioId);
                        if (thisRadioButton.checked == false) {
                            for (var k = 0; k < thisClass.length; k++) {
                                thisClass[k].style.backgroundColor = '#ddd';
                            }                     
                            thisClass[1].style.borderTop = '1px solid #ddd';
                            thisClass[1].style.borderBottom = '1px solid #ddd';
                        }
                        
                    }
                    
                   
                    
                    
                    
                    hoverClasses[j].onmouseout = function() {
                        var thisClassName = this.className;
                        var thisClass = W.getElementsByClassName(thisClassName);
                        var thisNumber = thisClassName.slice(-1);
                        var thisRadioId = 'firstPos' + thisNumber;
                        var thisRadioButton = W.getElementById(thisRadioId);
                        if (thisRadioButton.checked == false) {
                            this.style.backgroundColor = '#fff';
                            for (var k = 0; k < thisClass.length; k++) {
                                thisClass[k].style.backgroundColor = '#fff';
                            }
                            thisClass[1].style.borderTop = '1px solid #000';
                            thisClass[1].style.borderBottom = '1px solid #000';
                        }
                    }
                    
                    
                    
                    
                    hoverClasses[j].onclick = function() {
                        var thisClass = this.className;
                        var thisNumber = thisClass.slice(-1);
                        if(highlightClass1) {
                            for (var k = 0; k < highlightClass1.length; k++) {
                                highlightClass1[k].style.backgroundColor = '#fff';
                            }
                            highlightClass1[1].style.borderTop = '1px solid #000';
                            highlightClass1[1].style.borderBottom = '1px solid #000';     
                        }
                        var thisRadioId = 'firstPos' + thisNumber;
                        var thisRadioButton = W.getElementById(thisRadioId);
                        thisRadioButton.checked = true;
                        var thisClassElement = W.getElementsByClassName(thisClass);
                        highlightClass1 = thisClassElement;
                        for (var k = 0; k < thisClassElement.length; k++) {
                            thisClassElement[k].style.backgroundColor = '#ddb';
                        }
                        thisClassElement[1].style.borderTop = '1px solid #ddb';
                        thisClassElement[1].style.borderBottom = '1px solid #ddb';
                        
                    }
                }
            }
            
            
            
            for (var i = 0; i < 9; i++) {
                var hoverClassesNames2 = 'secondHoverclass' + i;
                var hoverClasses2 = W.getElementsByClassName(hoverClassesNames2);
                for (var j = 0; j < hoverClasses2.length; j++) {
                    hoverClasses2[j].onmouseover = function() {
                        var thisClassName = this.className;
                        var thisClass = W.getElementsByClassName(thisClassName);
                        var thisNumber = thisClassName.slice(-1);
                        var thisRadioId = 'secondPos' + thisNumber;
                        var thisRadioButton = W.getElementById(thisRadioId);
                        if (thisRadioButton.checked == false) {
                            for (var k = 0; k < thisClass.length; k++) {
                                thisClass[k].style.backgroundColor = '#ddd';
                            }
                            thisClass[1].style.borderTop = '1px solid #ddd';
                            thisClass[1].style.borderBottom = '1px solid #ddd';
                        }
                        
                    }
                    hoverClasses2[j].onmouseout = function() {
                        var thisClassName = this.className;
                        var thisClass = W.getElementsByClassName(thisClassName);
                        var thisNumber = thisClassName.slice(-1);
                        var thisRadioId = 'secondPos' + thisNumber;
                        var thisRadioButton = W.getElementById(thisRadioId);
                        if (thisRadioButton.checked == false) {
                            this.style.backgroundColor = '#fff';
                            for (var k = 0; k < thisClass.length; k++) {
                                thisClass[k].style.backgroundColor = '#fff';
                            }
                            thisClass[1].style.borderTop = '1px solid #000';
                            thisClass[1].style.borderBottom = '1px solid #000';
                        }
                    }

                    
                    
                    hoverClasses2[j].onclick = function() {
                        var thisClass = this.className;
                        var thisNumber = thisClass.slice(-1);
                        if(highlightClass2) {
                            for (var k = 0; k < highlightClass2.length; k++) {
                                highlightClass2[k].style.backgroundColor = '#fff';
                            }
                            highlightClass2[1].style.borderTop = '1px solid #000';
                            highlightClass2[1].style.borderBottom = '1px solid #000';     
                        }
                        var thisRadioId = 'secondPos' + thisNumber;
                        var thisRadioButton = W.getElementById(thisRadioId);
                        thisRadioButton.checked = true;
                        var thisClassElement = W.getElementsByClassName(thisClass);
                        highlightClass2 = thisClassElement;
                        for (var k = 0; k < thisClassElement.length; k++) {
                            thisClassElement[k].style.backgroundColor = '#ddb';
                        }               
                        thisClassElement[1].style.borderTop = '1px solid #ddb';
                        thisClassElement[1].style.borderBottom = '1px solid #ddb';
                    }
                }
            }
            
            
                
                
            
            b.onclick = function() {
          
                for (var i = 0; i < 9; i++) {
                    
                    var posname = 'firstPos' + i;
                    var position = W.getElementById(posname);
                    if (position.checked) {
                        var offer1 = position.value;
                        break;
                    }
                }
                

                for (var i = 0; i < 9; i++) {
                    
                    var posname2 = 'secondPos' + i;
                    var position2 = W.getElementById(posname2);
                    if (position2.checked) {
                        var offer2 = position2.value;
                        break;
                    }
                }
                
                var badAlert = W.getElementById('badAlert');
                var goodAlert = W.getElementById('goodAlert');
                
                if (!offer1 || !offer2) {
                    badAlert.style.display = '';
                    //alert('Please make a choice for both allocations!');
                } else {
                    badAlert.style.display = 'none';
                    goodAlert.style.display = '';
                    node.emit('BID_DONE', offer1, offer2, other);
                }
            };

            root = W.getElementById('container');

            node.timer.setTimestamp('bidder_loaded');

        }, { cache: { loadMode: 'cache', storeMode: 'onLoad' } });
    });

    console.log('Ultimatum');
}

function feedback() {
    var root, b, options;

    node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL',
                                     'COUNT_UP_ROUNDS_TO_TOTAL']);

    W.loadFrame('feedback.html', function() {                                 

        // Hack to avoid double offers. Todo: fix.
        node.game.offerDone = false;


        node.on.data('OTHER_OFFER', function(msg) {
        
            //console.log('CHOICES DONE!');
            //other = msg.data.other;
            //node.set({role: 'BIDDER'});
            
            
            options = {
                    /*timeup: function() {
                        node.done();
                    }*/
            };
            node.game.timer.startTiming(options);
            
            
                        
            var chosenValueIndex1 = node.game.lastOffer1;
            var chosenValue1 = node.game.settings.receive1[chosenValueIndex1];            
            
            var chosenValueIndex2 = node.game.lastOffer2;
            var chosenValue2 = node.game.settings.receive2[chosenValueIndex2];       
            
            var otherValueIndex1 = msg.data.offer1;
            var otherValue1 = node.game.settings.send1[otherValueIndex1]
            
            var otherValueIndex2 = msg.data.offer2;  
            var otherValue2 = node.game.settings.send2[otherValueIndex2]
            
            var roundpayoff = chosenValue1 + chosenValue2 + otherValue1 + otherValue2;  
            var thepayoffSpan = W.getElementById('thepayoff');
            thepayoffSpan.innerHTML = roundpayoff;
            
            var blackClassesName1 = 'firstHoverclass' + chosenValueIndex1;
            var blackClasses1 = W.getElementsByClassName(blackClassesName1);
            for (var i = 0; i < blackClasses1.length; i++) {
                blackClasses1[i].style.backgroundColor = '#000';
                blackClasses1[i].style.color = '#fff';
                
                //thisClass[k].style.border = '1px solid #000';
            }
            blackClasses1[0].style.fontWeight = 'bold';
            

            
            var blackClassesName2 = 'secondHoverclass' + chosenValueIndex2;
            var blackClasses2 = W.getElementsByClassName(blackClassesName2);
            for (var i = 0; i < blackClasses2.length; i++) {
                blackClasses2[i].style.backgroundColor = '#000';
                blackClasses2[i].style.color = '#fff';
                
                //thisClass[k].style.border = '1px solid #000';
            }
            blackClasses2[0].style.fontWeight = 'bold';
            
            var blackClassesName3 = 'thirdHoverclass' + otherValueIndex1;
            var blackClasses3 = W.getElementsByClassName(blackClassesName3);
            var numberOfClasses3 = blackClasses3.length;
            for (var i = 0; i < numberOfClasses3; i++) {
                blackClasses3[i].style.backgroundColor = '#000';
                blackClasses3[i].style.color = '#fff';
                
                //thisClass[k].style.border = '1px solid #000';
            }
            blackClasses3[numberOfClasses3 - 1].style.fontWeight = 'bold';
            

            
            var blackClassesName4 = 'fourthHoverclass' + otherValueIndex2;
            var blackClasses4 = W.getElementsByClassName(blackClassesName4);
            var numberOfClasses4 = blackClasses4.length;
            for (var i = 0; i < numberOfClasses4; i++) {
                blackClasses4[i].style.backgroundColor = '#000';
                blackClasses4[i].style.color = '#fff';
                
                //thisClass[k].style.border = '1px solid #000';
            }
            blackClasses4[numberOfClasses4 - 1].style.fontWeight = 'bold';
            
            
            root = W.getElementById('container');

            node.timer.setTimestamp('bidder_loaded');
               
        
        });
        
        b = W.getElementById('continue');

        b.onclick = function() {
            node.done();
        };
        
    }, { cache: { loadMode: 'cache', storeMode: 'onLoad' } });

 
    console.log('Feedback');
}

function totalpayoff() {
    var b;
    node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);
    
    W.loadFrame('totalpayoff.html', function() {
        node.on.data('PAYOFFS', function(msg) {
            
            var payoffs, payoffSpan, payoffSum, realPayoff, realPayoffSpan;
            
            payoffs = msg.data;
            payoffSum = 0;
            
            var i;
           
          
            for(i = 0; i < payoffs.length; ++i) {
                var myIndex = parseInt(payoffs[i].myoffer1);
                payoffSum += node.game.settings.receive1[myIndex];
                var myIndex2 = parseInt(payoffs[i].myoffer2);
                payoffSum += node.game.settings.receive2[myIndex2];
                var otherIndex = parseInt(payoffs[i].otherOffer1);
                payoffSum += node.game.settings.send1[otherIndex];
                var otherIndex2 = parseInt(payoffs[i].otherOffer2);
                payoffSum += node.game.settings.send2[otherIndex2];
            }
           
          
            payoffSpan = W.getElementById('totalpayoff');
            payoffSpan.innerHTML = payoffSum;
            
            realPayoff = payoffSum / node.game.settings.EXCHANGE_RATE;
            var realPayoffRounded = parseFloat(realPayoff).toFixed(2);
            realPayoffSpan = W.getElementById('realpayoffSpan');
            realPayoffSpan.innerHTML = realPayoffRounded;


            node.env('auto', function() {
                node.timer.randomExec(function() {
                    node.game.timer.doTimeUp();
                });
            });
            
            
            b = W.getElementById('continue');

            b.onclick = function() {
                node.done();
            };
        });
        
    });
    
}

function postgame() {
    node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);

    W.loadFrame('postgame.html', function() {

        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.timer.doTimeUp();
            });
        });
    });
    console.log('Postgame');
}

function endgame() {
    W.loadFrame('ended.html', function() {

        node.game.timer.switchActiveBoxTo(node.game.timer.mainBox);
        node.game.timer.waitBox.hideBox();
        node.game.timer.setToZero();
        node.on.data('WIN', function(msg) {
            var win, exitcode, codeErr;
            var root;
            root = W.getElementById('container');
            codeErr = 'ERROR (code not found)';
            win = msg.data && msg.data.win || 0;
            exitcode = msg.data && msg.data.exitcode || codeErr;
            W.writeln('Your bonus in this game is: ' + win, root);
            W.writeln('Your exitcode is: ' + exitcode, root);
        });
    });

    console.log('Game ended');
}

function clearFrame() {
    node.emit('INPUT_DISABLE');
    return true;
}

function notEnoughPlayers() {
    console.log('Not enough players');
    node.game.pause();
    W.lockScreen('One player disconnected. We are now waiting to see if ' +
                 'he or she reconnects. If not the game will be terminated.');
}
