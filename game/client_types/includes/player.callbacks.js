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
    quiz2: quiz2,
    ultimatum: ultimatum,
    feedback: feedback,
    totalpayoff: totalpayoff,
    postgame: postgame,
    postgame2: postgame2,
    postgame3: postgame3,
    endgame: endgame,
    clearFrame: clearFrame,
    notEnoughPlayers: notEnoughPlayers
};



function init() {
    var that, waitingForPlayers, treatment, header;

    that = this;
    this.node.log('Init.');
    treatment = node.env('treatment');

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


    // Event listener for quiz
    node.on('QUIZ_DONE', function(numberOfPersons, payoffQuiz1, payoffQuiz2, timeup) {
        var root, time;

        // Time to make a bid.
        time = node.timer.getTimeSince('quiz_loaded');
        
        // Hack. To avoid double offers. Todo: fix.
        // if (node.game.offerDone) return;
        // node.game.offerDone = true;

        node.game.timer.clear();
        node.game.timer.startWaiting({milliseconds: 30000});
        
        //save quiz answers for quiz feedback
        node.game.numberOfPersons = numberOfPersons;
        node.game.payoffQuiz1 = payoffQuiz1;
        node.game.payoffQuiz2 = payoffQuiz2;
        
        // Notify the other player?
        // node.say('OFFER', to, {offer1: offer1, offer2: offer2});

        root = W.getElementById('container');
         
        // Notify the server.
        node.done({
            numberOfPersons: numberOfPersons,
            payoffQuiz1: payoffQuiz1,
            payoffQuiz2: payoffQuiz2,
            timeup: timeup,
            //other: node.game.other
        });
    });
    
    
     // Event listeners for questionnaire
    node.on('QUEST1_DONE', function(choicesValue, intendValue, dependValue, timeup) {
        node.game.timer.clear();
        node.game.timer.startWaiting({milliseconds: 30000});
         
        // Notify the server.
        node.done({
            choicesValue: choicesValue,
            intendValue: intendValue,
            dependValue: dependValue,
            timeup: timeup,
        });
    });
    
    node.on('QUEST2_DONE', function(motivationValue, genderValue, hitsSubmittedValue, timeup) {
        node.game.timer.clear();
        node.game.timer.startWaiting({milliseconds: 30000});
         
        // Notify the server.
        node.done({
            motivationValue: motivationValue,
            genderValue: genderValue,
            hitsSubmittedValue: hitsSubmittedValue,
            timeup: timeup,
        });
    });
    
    node.on('QUEST3_DONE', function(understoodValue, commentsValue, timeup) {
        node.game.timer.clear();
        node.game.timer.startWaiting({milliseconds: 30000});
         
        // Notify the server.
        node.done({
            understoodValue: understoodValue,
            commentsValue: commentsValue,
            timeup: timeup,
        });
    });
    

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
    
    node.on('BONUS', function(bonus) {
        node.done({
            bonus: bonus,
            treatment: treatment
        });
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


    // Adapting the game to the treatment.
    if (treatment == 'nf') {
        node.game.instructionsPage = 'instructions_nf.html';
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
        // 'quiz.html',
        // 'bidder.html',

        // These two are cached later by loadFrame calls (for demonstration):
        // 'langPath + 'bidder.html',
        // 'langPath + 'resp.html',

        'postgame.html',
        'postgame2.html',
        'postgame3.html',
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

        var options = {
            milliseconds: 120000,
            timeup: function() {
                node.done();
            }
        };


        node.game.timer.startTiming(options);

        /*
        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.timer.doTimeUp();
            });
        });
        */
        
        /* function selectRadio(i, className, thisId) {
            var thisNumber = thisId.slice(-1);
            var thisRadioId = className + '_radio' + thisNumber;
            var thisRadio = W.getElementById(thisRadioId);
            thisRadio.checked = true;               
        } */
        
        for (var i = 0; i < 3; i++) {
            var quizClassesId1 = 'personsQuiz' + i;
            var quizClasses1 = W.getElementById(quizClassesId1);
            quizClasses1.onclick = function(i) {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'personsQuiz_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }
        
        for (var i = 0; i < 6; i++) {
            var quizClassesId2 = 'payoffQuiz1_' + i;
            var quizClasses2 = W.getElementById(quizClassesId2);
            quizClasses2.onclick = function(i) {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'payoffQuiz1_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }
        
        for (var i = 0; i < 6; i++) {
            var quizClassesId3 = 'payoffQuiz2_' + i;
            var quizClasses3 = W.getElementById(quizClassesId3);
            quizClasses3.onclick = function(i) {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'payoffQuiz2_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }
        
       
        
            
        var b = W.getElementById('continue');

        b.onclick = function() {
            
            //get chosen values
            
            var numberOfPersons;
            for (var i = 0; i < 3; i++) {
                var posname1 = 'personsQuiz_radio' + i;
                var position1 = W.getElementById(posname1);
                if (position1.checked) {
                    numberOfPersons = position1.value;
                    break;
                }
            }
            
            
            var payoffQuiz1;
            for (var i = 0; i < 6; i++) {
                var posname2 = 'payoffQuiz1_radio' + i;
                var position2 = W.getElementById(posname2);
                if (position2.checked) {
                    payoffQuiz1 = position2.value;
                    break;
                }
            }
            
            var payoffQuiz2;
            for (var i = 0; i < 6; i++) {
                var posname3 = 'payoffQuiz2_radio' + i;
                var position3 = W.getElementById(posname3);
                if (position3.checked) {
                    payoffQuiz2 = position3.value;
                    break;
                }
            }
            
            var badAlert = W.getElementById('badAlert');
            var goodAlert = W.getElementById('goodAlert');
                
            if (!numberOfPersons || !payoffQuiz1 || !payoffQuiz2) {
                badAlert.style.display = '';
            } else {
                badAlert.style.display = 'none';
                goodAlert.style.display = '';
                node.emit('QUIZ_DONE', numberOfPersons, payoffQuiz1, payoffQuiz2);
            }        
            
        };
        
        
        node.timer.setTimestamp('quiz_loaded');
        
    });
    
    
    console.log('Quiz');
}


function quiz2() {
    // Feedback stage for quiz
    W.loadFrame('quiz2.html', function() {

        var options = {
            milliseconds: 60000,
            timeup: function() {
                node.done();
            }
        };

        node.game.timer.startTiming(options);
        
       
        var numberOfPersons = node.game.numberOfPersons;
        var payoffQuiz1 = node.game.payoffQuiz1;
        var payoffQuiz2 = node.game.payoffQuiz2;
        
        var correctAnswers = 0;
        if (numberOfPersons == 1){
            correctAnswers += 1;
        }
        if (payoffQuiz1 == 185) {
            correctAnswers += 1;
        }
        if (payoffQuiz2 == 65) {
            correctAnswers += 1;
        }
        
        
        var quizResultSpan = W.getElementById('quizResult');
        var quizResultText = 'You have ' + correctAnswers + ' correct answers out of 3 questions.'
        if (correctAnswers != 3) {
            quizResultText += ' Please review your wrong answers:';
            
            if (numberOfPersons != 1) {
                var numberOfPersonsP = W.getElementById('numberOfPersons');
                numberOfPersonsP.style.display = '';    
            }
            if (payoffQuiz1 != 185) {
                var payoffQuiz1P = W.getElementById('payoffQuiz1');
                payoffQuiz1P.style.display = '';    
            }
            if (payoffQuiz2 != 65) {
                var payoffQuiz2P = W.getElementById('payoffQuiz2');
                payoffQuiz2P.style.display = ''; 
            }
        }
        
        quizResultSpan.innerHTML = quizResultText;

        
        var b = W.getElementById('continue');
        

        b.onclick = function() {
            node.done();
        };
        
    });
    console.log('Quiz Feedback');
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
            var round = node.player.stage.round;
            var timer;
            if (round == 1 || round == 2) {
                timer = 60000;
            }
            else {
                timer = 30000;
            }
            
            options = {
                milliseconds: timer,
                timeup: function() {
                    var lastChosenValue1 = 4;
                    var lastChosenValue2 = 4;
                    if (node.game.lastOffer1 && node.game.lastOffer2) {
                        lastChosenValue1 = node.game.lastOffer1;
                        lastChosenValue2 = node.game.lastOffer2;
                    }
                    
                    node.emit('BID_DONE', lastChosenValue1, lastChosenValue2, other, true); //Change this to value of last choice! (if undefined = 4)
                }
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
            if (node.env('reload')) {
                debugger;
            }

            options = {
                    milliseconds: 30000,
                    timeup: function() {
                        node.done();
                    }
            };
            node.game.timer.startTiming(options);
            
            
            // Get the input from last round            
            var chosenValueIndex1 = node.game.lastOffer1;
            var chosenValue1 = node.game.settings.receive1[chosenValueIndex1];            
            
            var chosenValueIndex2 = node.game.lastOffer2;
            var chosenValue2 = node.game.settings.receive2[chosenValueIndex2];       
            
            var otherValueIndex1 = msg.data.offer1;
            var otherValue1 = node.game.settings.send1[otherValueIndex1]
            
            var otherValueIndex2 = msg.data.offer2;  
            var otherValue2 = node.game.settings.send2[otherValueIndex2]
            
            // Show the first sentence for feedback treatment and pass it the values
            var treatment = node.env('treatment');
            if (treatment != 'nf') {
                var feedbackSentence = W.getElementById('feedbackSentence');
                feedbackSentence.style.display = '';
                
                var chosenValueSpan1 = W.getElementById('self1');
                chosenValueSpan1.innerHTML = chosenValue1;
                var chosenValueSpan2 = W.getElementById('self2');
                chosenValueSpan2.innerHTML = chosenValue2;
                var otherValueSpan1 = W.getElementById('other1');
                otherValueSpan1.innerHTML = otherValue1;
                var otherValueSpan2 = W.getElementById('other2');
                otherValueSpan2.innerHTML = otherValue2;
            }
            
            // Pay.off for this round. Not displayed
            /*
            var roundpayoff = chosenValue1 + chosenValue2 + otherValue1 + otherValue2;  
            var thepayoffSpan = W.getElementById('thepayoff');
            thepayoffSpan.innerHTML = roundpayoff;
            */
            
            // Highlight selected values in sliders on feedback page
            // Colors?
            var blackClassesName1 = 'firstHoverclass' + chosenValueIndex1;
            var blackClasses1 = W.getElementsByClassName(blackClassesName1);
            for (var i = 0; i < blackClasses1.length; i++) {
                blackClasses1[i].style.backgroundColor = '#660';
                blackClasses1[i].style.color = '#fff';
                
                //blackClasses1[i].style.borderTop = '1px solid #660';
            }
            blackClasses1[1].style.borderTop = '1px solid #660';
            blackClasses1[1].style.borderBottom = '1px solid #660';
            blackClasses1[0].style.fontWeight = 'bold';
            

            
            var blackClassesName2 = 'secondHoverclass' + chosenValueIndex2;
            var blackClasses2 = W.getElementsByClassName(blackClassesName2);
            for (var i = 0; i < blackClasses2.length; i++) {
                blackClasses2[i].style.backgroundColor = '#660';
                blackClasses2[i].style.color = '#fff';
                
                //thisClass[k].style.border = '1px solid #000';
            }
            blackClasses2[1].style.borderTop = '1px solid #660';
            blackClasses2[1].style.borderBottom = '1px solid #660';
            blackClasses2[0].style.fontWeight = 'bold';
            
            
            var treatment = node.env('treatment');
            if (treatment != 'nf') {
                var colors = W.getElementById('colors');
                colors.style.display = '';
                
                
                var blackClassesName3 = 'firstHoverclass' + otherValueIndex1;
                var blackClasses3 = W.getElementsByClassName(blackClassesName3);
                var numberOfClasses3 = blackClasses3.length;
                for (var i = 0; i < numberOfClasses3; i++) {
                    
                    if (chosenValueIndex1 == otherValueIndex1) {
                        //blackClasses3[i].style.backgroundColor = '';
                        blackClasses3[i].style.background = '#009';
                        blackClasses3[i].style.background = "#f00 url('../pictures/stripes.gif') repeat";
                        //blackClasses3[i].style.background = '-moz-repeating-linear-gradient(45deg,#606dbc,#606dbc 10px,#465298 10px,#465298 20px);';
                        blackClasses3[i].style.color = '#fff';
                    }
                    else {
                        blackClasses3[i].style.backgroundColor = '#714';
                        blackClasses3[i].style.color = '#fff';
                    }
                    
                    //thisClass[k].style.border = '1px solid #000';
                }
                blackClasses3[1].style.borderTop = '1px solid #714';
                blackClasses3[1].style.borderBottom = '1px solid #714';
                blackClasses3[numberOfClasses3 - 1].style.fontWeight = 'bold';
                

                
                var blackClassesName4 = 'secondHoverclass' + otherValueIndex2;
                var blackClasses4 = W.getElementsByClassName(blackClassesName4);
                var numberOfClasses4 = blackClasses4.length;
                for (var i = 0; i < numberOfClasses4; i++) {
                    
                    if (chosenValueIndex2 == otherValueIndex2) {
                        //blackClasses4[i].style.backgroundColor = '';
                        blackClasses4[i].style.background = '#009';
                        blackClasses4[i].style.background = "#f00 url('../pictures/stripes.gif') repeat";
                        //blackClasses4[i].style.background = '-moz-repeating-linear-gradient(45deg,#606dbc,#606dbc 10px,#465298 10px,#465298 20px);';
                        blackClasses4[i].style.color = '#fff';
                    }
                    else {
                        blackClasses4[i].style.backgroundColor = '#714';
                        blackClasses4[i].style.color = '#fff';
                    }
                                    
                    //thisClass[k].style.border = '1px solid #000';
                }
                blackClasses4[1].style.borderTop = '1px solid #714';
                blackClasses4[1].style.borderBottom = '1px solid #714';
                blackClasses4[numberOfClasses4 - 1].style.fontWeight = 'bold';
            }
            else {
                var colorsNF = W.getElementById('colorsNF');
                colorsNF.style.display = ''; 
            }
            
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

    // Request payoff.
    node.say('totpayoff', 'SERVER');
    
    W.loadFrame('totalpayoff.html', function() {

        node.on.data('PAYOFFS', function(msg) {
            
            var options = {
                    timeup: function() {
                        node.done();
                    }
            };
            node.game.timer.startTiming(options);
            
          
            var payoffs = msg.data;
            var payoffSumSelf = 0;
            var payoffSumOther = 0;
            
            var i;
           
          
            for(i = 0; i < payoffs.length; ++i) {
                // Pay-Off from your own choices
                var myIndex = parseInt(payoffs[i].myoffer1);
                var payFromSelf1 = node.game.settings.receive1[myIndex];

                var myIndex2 = parseInt(payoffs[i].myoffer2);
                var payFromSelf2 = node.game.settings.receive1[myIndex2];
                
                var payFromSelf = payFromSelf1 + payFromSelf2;
                payoffSumSelf += payFromSelf;
                var payFromSelfName = 'payFromSelf' + i;
                var payFromSelfSpan = W.getElementById(payFromSelfName);
                payFromSelfSpan.innerHTML = payFromSelf;
                
                
                // Pay-Off from your partners choices
                var otherIndex = parseInt(payoffs[i].otherOffer1);
                var payFromOther1 = node.game.settings.send1[otherIndex];
                
                var otherIndex2 = parseInt(payoffs[i].otherOffer2);
                var payFromOther2 = node.game.settings.send2[otherIndex2];
                
                var payFromOther = payFromOther1 + payFromOther2;
                payoffSumOther += payFromOther;
                var payFromOtherName = 'payFromOther' + i;
                var payFromOtherSpan = W.getElementById(payFromOtherName);
                payFromOtherSpan.innerHTML = payFromOther;
                
            }
           
            
            var totalFromSelfSpan = W.getElementById('totalFromSelf');
            totalFromSelfSpan.innerHTML = payoffSumSelf;
            var totalFromSelfSpan2 = W.getElementById('totalFromSelf2');
            totalFromSelfSpan2.innerHTML = payoffSumSelf;
            
            var totalFromOtherSpan = W.getElementById('totalFromOther');
            totalFromOtherSpan.innerHTML = payoffSumOther;
            var totalFromOtherSpan2 = W.getElementById('totalFromOther2');
            totalFromOtherSpan2.innerHTML = payoffSumOther;
           
            var payoffSum = payoffSumSelf + payoffSumOther;
            
            var payoffSpan = W.getElementById('totalpayoff');
            payoffSpan.innerHTML = payoffSum;
            
            var realPayoff = payoffSum / node.game.settings.EXCHANGE_RATE;
            var realPayoffRounded = parseFloat(realPayoff).toFixed(2);
            var realPayoffSpan = W.getElementById('realpayoffSpan');
            realPayoffSpan.innerHTML = realPayoffRounded;


            node.env('auto', function() {
                node.timer.randomExec(function() {
                    node.game.timer.doTimeUp();
                });
            });
            
            
            b = W.getElementById('continue');

            b.onclick = function() {
                node.emit('BONUS', realPayoffRounded);
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
        
            
            
        
        for (var i = 0; i < 3; i++) {
            var questionnaireClassesId1 = 'choices' + i;
            var questionnaireClasses1 = W.getElementById(questionnaireClassesId1);
            questionnaireClasses1.onclick = function(i) {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'choices_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }
        
        for (var i = 0; i < 3; i++) {
            var questionnaireClassesId2 = 'intend' + i;
            var questionnaireClasses2 = W.getElementById(questionnaireClassesId2);
            questionnaireClasses2.onclick = function(i) {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'intend_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }
        
        for (var i = 0; i < 4; i++) {
            var questionnaireClassesId3 = 'depend' + i;
            var questionnaireClasses3 = W.getElementById(questionnaireClassesId3);
            questionnaireClasses3.onclick = function(i) {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'depend_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }
        
        var b = W.getElementById('submit');
        
        b.onclick = function() {

            for (var i = 0; i < 3; i++) {
                var posname = 'choices_radio' + i;
                var position = W.getElementById(posname);
                if (position.checked) {
                    var choicesValue = position.value;
                    break;
                }
            }
            
            for (var i = 0; i < 3; i++) {
                var posname2 = 'intend_radio' + i;
                var position2 = W.getElementById(posname2);
                if (position2.checked) {
                    var intendValue = position2.value;
                    break;
                }
            }
            
            for (var i = 0; i < 4; i++) {
                var posname3 = 'depend_radio' + i;
                var position3 = W.getElementById(posname3);
                if (position3.checked) {
                    var dependValue = position3.value;
                    break;
                }
            }
            
            
            var badAlert = W.getElementById('badAlert');
            var goodAlert = W.getElementById('goodAlert');
            
            if (!choicesValue || !intendValue || !dependValue) {
                badAlert.style.display = '';
            } else {
                badAlert.style.display = 'none';
                goodAlert.style.display = '';
                node.emit('QUEST1_DONE', choicesValue, intendValue, dependValue);
            }    
            
        }
        
        
    });
    
    console.log('Postgame');
}


function postgame2() {
    node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);

    W.loadFrame('postgame2.html', function() {

        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.timer.doTimeUp();
            });
        });
        
        
            
        for (var i = 0; i < 4; i++) {
            var questionnaireClassesId4 = 'motivation' + i;
            var questionnaireClasses4 = W.getElementById(questionnaireClassesId4);
            questionnaireClasses4.onclick = function(i) {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'motivation_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }
        
        for (var i = 0; i < 2; i++) {
            var questionnaireClassesId5 = 'gender' + i;
            var questionnaireClasses5 = W.getElementById(questionnaireClassesId5);
            questionnaireClasses5.onclick = function(i) {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'gender_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }
        
        
        var b = W.getElementById('submit');
        
        b.onclick = function() {

            for (var i = 0; i < 4; i++) {
                var posname = 'motivation_radio' + i;
                var position = W.getElementById(posname);
                if (position.checked) {
                    var motivationValue = position.value;
                    break;
                }
            }
            
            for (var i = 0; i < 2; i++) {
                var posname2 = 'gender_radio' + i;
                var position2 = W.getElementById(posname2);
                if (position2.checked) {
                    var genderValue = position2.value;
                    break;
                }
            }
            
            var hitsSubmitted = W.getElementById('hitsSubmitted');
            var hitsSubmittedValue = hitsSubmitted.value;
                    
            
            var badAlert = W.getElementById('badAlert');
            var goodAlert = W.getElementById('goodAlert');
            
            if (!motivationValue || !genderValue || !hitsSubmittedValue) {
                badAlert.style.display = '';
            } else {
                badAlert.style.display = 'none';
                goodAlert.style.display = '';
                node.emit('QUEST2_DONE', motivationValue, genderValue, hitsSubmittedValue);
            }    
            
        }
        
    });
    
    console.log('Postgame2');
}


function postgame3() {
    node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);

    W.loadFrame('postgame3.html', function() {

        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.timer.doTimeUp();
            });
        });
    
       
        for (var i = 0; i < 3; i++) {
            var questionnaireClassesId6 = 'understood' + i;
            var questionnaireClasses6 = W.getElementById(questionnaireClassesId6);
            questionnaireClasses6.onclick = function() {
                var thisId = this.id;
                var thisNumber = thisId.slice(-1);
                var thisRadioId = 'understood_radio' + thisNumber;
                var thisRadio = W.getElementById(thisRadioId);
                thisRadio.checked = true;               
            }
        }

        var b = W.getElementById('submit');
        
        b.onclick = function() {

            for (var i = 0; i < 3; i++) {
                var posname = 'understood_radio' + i;
                var position = W.getElementById(posname);
                if (position.checked) {
                    var understoodValue = position.value;
                    break;
                }
            }
            
            var comments = W.getElementById('comments');
            var commentsValue = comments.value;
                    
            
            var badAlert = W.getElementById('badAlert');
            var goodAlert = W.getElementById('goodAlert');
            
            if (!understoodValue) {
                badAlert.style.display = '';
            } else {
                badAlert.style.display = 'none';
                goodAlert.style.display = '';
                node.emit('QUEST3_DONE', understoodValue, commentsValue);
            }    
            
        }
    
    });
    console.log('Postgame3');
}



function endgame() {
    
    // Request endgame data.
    node.say('endgame', 'SERVER');
    
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
            var exitCodeInput = W.getElementById('exitCode');
            exitCodeInput.value = exitcode;
            
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
