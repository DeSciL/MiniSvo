/**
 * # Functions used by the client of MiniSvo Game
 */

module.exports = {
    init: init,
    precache: precache,
    selectLanguage: selectLanguage,
    instructions: instructions,
    quiz: quiz,
    quiz2: quiz2,
    choices: choices,
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

        node.game.visualTimer = node.widgets.append('VisualTimer', header);
    
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

        node.game.visualTimer.clear();
        node.game.visualTimer.startWaiting({milliseconds: 30000});
        
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
        node.game.visualTimer.clear();
        node.game.visualTimer.startWaiting({milliseconds: 30000});
         
        // Notify the server.
        node.done({
            choicesValue: choicesValue,
            intendValue: intendValue,
            dependValue: dependValue,
            timeup: timeup,
        });
    });
    
    node.on('QUEST2_DONE', function(motivationValue, genderValue, hitsSubmittedValue, timeup) {
        node.game.visualTimer.clear();
        node.game.visualTimer.startWaiting({milliseconds: 30000});
         
        // Notify the server.
        node.done({
            motivationValue: motivationValue,
            genderValue: genderValue,
            hitsSubmittedValue: hitsSubmittedValue,
            timeup: timeup,
        });
    });
    
    node.on('QUEST3_DONE', function(understoodValue, commentsValue, timeup) {
        node.game.visualTimer.clear();
        node.game.visualTimer.startWaiting({milliseconds: 30000});
         
        // Notify the server.
        node.done({
            understoodValue: understoodValue,
            commentsValue: commentsValue,
            timeup: timeup,
        });
    });
    

    node.on('BID_DONE', function(choice, payoffSelf, payoffOther, timeClick, to, timeup, secondTimeup) {
        var root, time;

        // Time to make a bid.
        time = node.timer.getTimeSince('bidder_loaded');
        
        // Hack. To avoid double choices. Todo: fix.
        if (node.game.choiceDone) return;
        node.game.choiceDone = true;

        node.game.visualTimer.clear();
        node.game.visualTimer.startWaiting({milliseconds: 30000});

        W.getElementById('submitChoice').disabled = 'disabled';
        
        //save choice and timeup for feedback step
        //node.game.lastChoice1 = choice1;
        node.game.lastChoice = choice;


        // shortcut fix on undefined timeout, not robust. FIX!
        if(typeof timeup == 'undefined') {
            node.game.lastTimeup = true;
        }
        else {
            node.game.lastTimeup = timeup;
        }
        node.game.secondTimeup = secondTimeup;

        
        // Notify the other player.
        //node.say('CHOICE', to, {choice1: choice1, choice2: choice2});
        node.say('CHOICE', to, {choice: choice});

        root = W.getElementById('container');
        // Leave a space.
        //W.writeln(' Choice Allocation 1: ' +  choice1 + '. Choice Allocation 2: ' + choice2 +
        //          '. Waiting for the respondent... ', root);


        // Notify the server.
        node.done({
            //choice1: choice1,
            choice: choice,
            payoffSelf: payoffSelf,
            payoffOther: payoffOther,
            timeClick: timeClick,
            timeSubmit: time,
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

    this.randomAccept = function(choice, other) {
        var root, accepted;
        accepted = Math.round(Math.random());
        console.log('randomaccept');
        console.log(choice + ' ' + other);
        root = W.getElementById('container');
        if (accepted) {
            node.emit('RESPONSE_DONE', 'ACCEPT', choice, other);
            W.write(' You accepted the choice.', root);
        }
        else {
            node.emit('RESPONSE_DONE', 'REJECT', choice, other);
            W.write(' You rejected the choice.', root);
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
        window.scrollTo(0,0);

        var options = {
            milliseconds: 120000,
            timeup: function() {
                node.done();
            }
        };


        node.game.visualTimer.startTiming(options);

        /*
        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.visualTimer.doTimeUp();
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
        
        for (var i = 0; i < 3; i++) {
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
        
        for (var i = 0; i < 3; i++) {
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
            for (var i = 0; i < 3; i++) {
                var posname2 = 'payoffQuiz1_radio' + i;
                var position2 = W.getElementById(posname2);
                if (position2.checked) {
                    payoffQuiz1 = position2.value;
                    break;
                }
            }
            
            var payoffQuiz2;
            for (var i = 0; i < 3; i++) {
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
        window.scrollTo(0,0);

        var options = {
            milliseconds: 60000,
            timeup: function() {
                node.done();
            }
        };

        node.game.visualTimer.startTiming(options);
        
       
        var numberOfPersons = node.game.numberOfPersons;
        var payoffQuiz1 = node.game.payoffQuiz1;
        var payoffQuiz2 = node.game.payoffQuiz2;
        
        var correctAnswers = 0;
        if (numberOfPersons == 1){
            correctAnswers += 1;
        }
        if (payoffQuiz1 == 100) {
            correctAnswers += 1;
        }
        if (payoffQuiz2 == 50) {
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
            if (payoffQuiz1 != 100) {
                var payoffQuiz1P = W.getElementById('payoffQuiz1');
                payoffQuiz1P.style.display = '';    
            }
            if (payoffQuiz2 != 50) {
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

function choices() {

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


    // Hack to avoid double choices. Todo: fix.
    node.game.choiceDone = false;

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
            // Start the timer after an choice was received.
            window.scrollTo(0,0);

            var round = node.player.stage.round;

            var time, timer;
            var maximumTime = 60000;
            if (round == 1 || round == 2) {
                time = maximumTime;
            }
            else {
                time = maximumTime/2;
            }

            var secondTimeup = node.game.secondTimeup;
            if (secondTimeup){
                timer = maximumTime/10;
            }
            else {
                timer = time;
            }



            
            options = {
                milliseconds: timer,
                timeup: function() {


                    var selectionMade = false;
                    var timeup = false;
                    var lastTimeup = node.game.lastTimeup;
                    var secondTimeup;
                    var payoffSelf, payoffOther;

                    // has a selection been made?
                    for (var i = 0; i < 9; i++) {
                    
                        var posname2 = 'secondPos' + i;
                        var position2 = W.getElementById(posname2);
                        if (position2.checked) {
                            var timeupChoice = position2.value;
                            payoffSelf = node.game.settings.receive[timeupChoice];
                            payoffOther = node.game.settings.send[timeupChoice];
                            selectionMade = true;
                            break;
                        }
                    }

                    // no selection: random value; 0 payoff for self
                    if(!selectionMade) {
                        var timeupChoice = Math.floor(Math.random() * 9);
                        payoffSelf = 0;
                        timeup = true;
                        payoffOther = node.game.settings.send[timeupChoice];
                        if(lastTimeup){
                            secondTimeup = true;
                        }
                    }
                    
                    /*if (node.game.lastChoice2) {
                        lastChosenValue2 = node.game.lastChoice2;
                    }*/
                    
                    node.emit('BID_DONE', timeupChoice, payoffSelf, payoffOther, 0, other, timeup, secondTimeup);
                }
            };

            node.game.visualTimer.startTiming(options);


            b = W.getElementById('submitChoice');

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

      
            //var highlightClass1;
            var highlightClass2;
            var time;
            var timeClick;
                 
            
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

                        // save timestamnp for click
                        timeClick = node.timer.getTimeSince('bidder_loaded');

                    }
                }
            }
            
            
                
                
            
            b.onclick = function() {
          
                /*for (var i = 0; i < 9; i++) {
                    
                    var posname = 'firstPos' + i;
                    var position = W.getElementById(posname);
                    if (position.checked) {
                        var choice1 = position.value;
                        break;
                    }
                }*/
                

                for (var i = 0; i < 9; i++) {
                    
                    var posname2 = 'secondPos' + i;
                    var position2 = W.getElementById(posname2);
                    if (position2.checked) {
                        var choice = position2.value;
                        var payoffSelf = node.game.settings.receive[choice];
                        var payoffOther = node.game.settings.send[choice];
                        break;
                    }
                }
                
                var badAlert = W.getElementById('badAlert');
                var goodAlert = W.getElementById('goodAlert');
                
                /*if (!choice1 || !choice2) {
                    badAlert.style.display = '';
                } else {
                    badAlert.style.display = 'none';
                    goodAlert.style.display = '';
                    node.emit('BID_DONE', choice1, choice2, other);
                }*/

                if (!choice) {
                    badAlert.style.display = '';
                } else {
                    badAlert.style.display = 'none';
                    goodAlert.style.display = '';
                    node.emit('BID_DONE', choice, payoffSelf, payoffOther, timeClick, other, false, false);
                }
            };

            root = W.getElementById('container');

            node.timer.setTimestamp('bidder_loaded');

        }, { cache: { loadMode: 'cache', storeMode: 'onLoad' } });
    });

    console.log('Choices');
}

function feedback() {
    var root, b, options;

    node.game.rounds.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL',
                                     'COUNT_UP_ROUNDS_TO_TOTAL']);

    W.loadFrame('feedback.html', function() {
        window.scrollTo(0,0);                                 

        // Hack to avoid double choices. Todo: fix.
        node.game.choiceDone = false;

        


        var time, timer;
        time = 30000;
        var secondTimeup = node.game.secondTimeup;
        if (secondTimeup){
            timer = time/5;
        }
        else {
            timer = time;
        }


        options = {
                milliseconds: timer,
                timeup: function() {
                    node.done();
                }
        };
        node.game.visualTimer.startTiming(options);
        
        node.on.data('OTHER_CHOICE', function(msg) {
        
            //console.log('CHOICES DONE!');
            //other = msg.data.other;
            //node.set({role: 'BIDDER'});
            /*if (node.env('reload')) {
                debugger;
            }*/

            
            
            // Get the input from last round
            // If there is no values (happens on re-connect), just don't show any feedback, they already saw it.   
            /*var chosenValueIndex1 = node.game.lastChoice1;
            if(chosenValueIndex1) {
                var chosenValue1 = node.game.settings.receive1[chosenValueIndex1];
            }*/            
            
            

            var chosenValueIndex = node.game.lastChoice;
            var chosenValue;
            if(chosenValueIndex) {
                if(node.game.lastTimeup != true) {
                    chosenValue = node.game.settings.receive[chosenValueIndex];
                } else {
                    chosenValue = 0;
                }      
            }      
            
            
            /*var otherValueIndex1 = msg.data.choice1;
            if(otherValueIndex1) {
                var otherValue1 = node.game.settings.send1[otherValueIndex1]
            }*/
            
            var otherValueIndex = msg.data.choice;
            if(otherValueIndex) {
                var otherValue = node.game.settings.send[otherValueIndex]
            }
            
            
            // Show the first sentence for feedback treatment and pass it the values
            var treatment = node.env('treatment');
            /*if (treatment != 'nf' && chosenValue1 && chosenValue2 && otherValue1 && otherValue2) {
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
            }*/

            var timeup = node.game.lastTimeup;
            if (timeup) {
                var noSelection = W.getElementById('noSelection');
                noSelection.style.display = '';
            }
            else if(treatment != 'nf' && otherValue) {
                var feedbackSentence = W.getElementById('feedbackSentence');
                feedbackSentence.style.display = '';
                
                //var chosenValueSpan1 = W.getElementById('self1');
                //chosenValueSpan1.innerHTML = chosenValue1;
                var chosenValueSpan = W.getElementById('self2');
                chosenValueSpan.innerHTML = chosenValue;
                //var otherValueSpan1 = W.getElementById('other1');
                //otherValueSpan1.innerHTML = otherValue1;
                var otherValueSpan = W.getElementById('other2');
                otherValueSpan.innerHTML = otherValue;
            }
          
            if(chosenValueIndex && otherValue) {
                /*var firstSelfTopId = 'firstHoverTop' + chosenValueIndex1;
                var firstSelfMiddleId = 'firstHoverMiddle' + chosenValueIndex1;
                var firstSelfBottomId = 'firstHoverBottom' + chosenValueIndex1;
                

                var firstSelfTop = W.getElementById(firstSelfTopId);
                firstSelfTop.className += ' highlightSelfTop';

                var firstSelfMiddle = W.getElementById(firstSelfMiddleId);
                firstSelfMiddle.className += ' highlightSelfMiddle';

                var firstSelfBottom = W.getElementById(firstSelfBottomId);
                firstSelfBottom.className += ' highlightSelfBottom';*/

                
                var otherSelfTopId = 'secondHoverTop' + chosenValueIndex;
                var otherSelfMiddleId = 'secondHoverMiddle' + chosenValueIndex;
                var otherSelfBottomId = 'secondHoverBottom' + chosenValueIndex;

                var otherSelfTop = W.getElementById(otherSelfTopId);
                otherSelfTop.className += ' highlightSelfTop';

                var otherSelfMiddle = W.getElementById(otherSelfMiddleId);
                otherSelfMiddle.className += ' highlightSelfMiddle';

                var otherSelfBottom = W.getElementById(otherSelfBottomId);
                otherSelfBottom.className += ' highlightSelfBottom';

                
            // Feedback about partners choice
                var treatment = node.env('treatment');
                if(treatment != 'nf') {
                    var colors = W.getElementById('colors');
                    colors.style.display = '';
                    
                    
                    var secondOtherTopId = 'secondHoverTop' + otherValueIndex;
                    var secondOtherMiddleId = 'secondHoverMiddle' + otherValueIndex;
                    var secondOtherBottomId = 'secondHoverBottom' + otherValueIndex;
                    

                    if (chosenValueIndex == otherValueIndex) {
                        var secondSameTop = W.getElementById(secondOtherTopId);
                        secondSameTop.className += ' highlightSameTop';
                    }
                    else {
                        var secondOtherTop = W.getElementById(secondOtherTopId);
                        secondOtherTop.className += ' highlightOtherTop';
                    }

                    if (chosenValueIndex == otherValueIndex) {
                        var secondSameMiddle = W.getElementById(secondOtherMiddleId);
                        secondSameMiddle.className += ' highlightSameMiddle';
                    }
                    else {
                        var secondOtherMiddle = W.getElementById(secondOtherMiddleId);
                        secondOtherMiddle.className += ' highlightOtherMiddle';
                    }

                    if (chosenValueIndex == otherValueIndex) {
                        var secondSameBottom = W.getElementById(secondOtherBottomId);
                        secondSameBottom.className += ' highlightSameBottom';
                    }
                    else {
                        var secondOtherBottom = W.getElementById(secondOtherBottomId);
                        secondOtherBottom.className += ' highlightOtherBottom';
                    }

                } else {
                    var colorsNF = W.getElementById('colorsNF');
                    colorsNF.style.display = ''; 
                }
            }

            
            root = W.getElementById('container');

            node.timer.setTimestamp('bidder_loaded');
               
        
        });
        
        // if clients get pushed there is no feedback to be displayed!
        node.on.data('ERROR_CHOICE', function(msg) {
            var error = W.getElementById('error');
            error.style.display = ''; 
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
        window.scrollTo(0,0);

        node.on.data('PAYOFFS', function(msg) {
            
            var options = {
                    timeup: function() {
                        node.emit('BONUS', realPayoffRounded);
                    }
            };
            node.game.visualTimer.startTiming(options);
            
          
            var payoffs = msg.data;
            var payoffSumSelf = 0;
            var payoffSumOther = 0;
            
            var i;
           
          
            for(i = 0; i < payoffs.length; ++i) {
                // Pay-Off from your own choices
                //var myIndex = parseInt(payoffs[i].myChoice1);
                //var payFromSelf1 = node.game.settings.receive1[myIndex];

                var myIndex = parseInt(payoffs[i].myChoice);
                

                var payFromSelf = 0;
                if(payoffs[i].timeup != true){
                    payFromSelf = node.game.settings.receive[myIndex];
                }

                //var payFromSelf = payFromSelf1 + payFromSelf2;
                payoffSumSelf += payFromSelf;
                var payFromSelfName = 'payFromSelf' + i;
                var payFromSelfSpan = W.getElementById(payFromSelfName);
                payFromSelfSpan.innerHTML = payFromSelf;
                
                
                // Pay-Off from your partners choices
                //var otherIndex = parseInt(payoffs[i].otherChoice1);
                //var payFromOther1 = node.game.settings.send1[otherIndex];
                
                var otherIndex = parseInt(payoffs[i].otherChoice);
                var payFromOther = 0;
                if(payoffs[i].timeup != true){
                    payFromOther = node.game.settings.send[otherIndex];
                }
                
                //var payFromOther = payFromOther1 + payFromOther2;
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
                    node.game.visualTimer.doTimeUp();
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
        window.scrollTo(0,0);

        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.visualTimer.doTimeUp();
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
        window.scrollTo(0,0);

        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.visualTimer.doTimeUp();
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
        window.scrollTo(0,0);

        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.visualTimer.doTimeUp();
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
        window.scrollTo(0,0);

        node.game.visualTimer.switchActiveBoxTo(node.game.visualTimer.mainBox);
        node.game.visualTimer.waitBox.hideBox();
        node.game.visualTimer.setToZero();
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