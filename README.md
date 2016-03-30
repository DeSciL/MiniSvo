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
- Use max-width for mobile screens and test it
- Finish feedback page visuals
- Timers: actions?
- Update instructions and all texts
- Style top bar
- __Run multiple treatments simultaneously__ - Solve Waitingroom issue.
- __AMT integration__

#### To-do Priority 2:
- Channel definition in packages.json is strange