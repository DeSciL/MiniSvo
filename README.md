# MiniSVO Game

### Installation:
1. Install latest version of nodegame: http://nodegame.org/
2. Clone into /games/ directory

#### Note:
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


### To-do

#### Important:
- Fix Viewport / mobile screen visuals
- Finish instructions stranger treatment
- Send bonus to descil mturk
- ~~Different timer per round~~
- ~~Make totalpayoffs / questionnaire independent on partner~~
- ~~change ExitCode display in waitingroom~~
- ~~Improve quiz style~~
- ~~Timers: choose last chosen value~~
- ~~Show static slider in quiz~~
- ~~Quiz feedback stage~~
- ~~Check if quiz / questionnaire is completed~~
- ~~Save quiz data~~
- ~~Save questionnaire data~~
- ~~Small fixes: timer amounts, line-heights, width on small screens, width when scrollbar appears, etc.~~
- ~~Re-write URL when going live~~
- ~~Empty title string~~
- ~~Check out for people who wait 10 minutes in waiting room?~~ 
- ~~Re-connection issue?~~


#### Priority 2:
- Random order of values
- Waitscreen style
- Waiting room style (width, etc.)
- ~~Font size (in sliders)~~
- ~~Blue buttons~~
- ~~Seperate pages for questionnaire~~


#### Priority 3:
- Better solution for no-sync during final stages
- Channel definition in packages.json is strange
- Auth failed page locally not appearing
- Delete "Time left" in endgame-stage
- Add colon after Time left
- Waitscreen Text
- Pause timers in monitor
