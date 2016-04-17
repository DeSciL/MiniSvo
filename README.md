# MiniSVO Game

### Installation:
1. Install latest version of nodegame: http://nodegame.org/
2. Clone into /games/ directory

#### Note 1:
- As of now, the game will only work properly when the default ultimatum game exists in the gamefolder as well
- If ultimatum is not present, css will be off
- To be fixed soon

#### Note 2:
You need to have latest nodegame version installed (updated March 28th 2016)
If you have an older version installed, follow these steps:

1. In nodegame folder `cd node_modules/nodegame-window/`
2. `git pull`
3. In nodegame folder `cd node_modules/JSUS/`
4. `git pull`
5. In nodegame folder `cd node_modules/nodegame-client/`
6. `git pull`
7. In nodegame folder `cd node_modules/nodegame-server/`
8. `git pull`
9. `node bin/make.js build-client -a -o nodegame-full`


### To-do:
- Finish instructions
- Viewport / mobile screen visuals
- Timers: actions?
- Update instructions and all texts
- Random order of values
- Font size (in sliders)
- Show static slider in quiz
- Quiz feedback stage
- Save data from quiz
- Waitscreen style
- Waiting room style (width, etc.)
- Blue buttons
- Seperate pages for questionnaire
- Checks if quiz / questionnaire is completed




#### To-do Priority 2:
- Channel definition in packages.json is strange
- Auth failed page
- "Time left" in endgame-stage
- Waitscreen Text
- Pause timers in monitor
