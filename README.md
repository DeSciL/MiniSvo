# MiniSVO Game

### Installation:
1. Install latest version of nodegame: http://nodegame.org/
2. Clone into /games/ directory

#### Note 1:
- As of now, the game will only work properly when the default ultimatum game exists in the gamefolder as well
- If ultimatum is not present, css will be off
- To be fixed soon

#### Note 2:
You need to have latest nodegame version installed (updated March 9th 2016)
If you have an older version installed, follow these steps:

1. In nodegame folder `cd node_modules/nodegame-window/`
2. `git pull`
3. In nodegame folder `cd node_modules/JSUS/`
4. `git pull`
5. In nodegame folder `cd node_modules/nodegame-server/`
6. `git pull`
7. `node bin/make.js build-client -a -o nodegame-full`


### To-do:
- Finish feedback page visuals
- Timers: actions?
- Update instructions and all texts
- Style top bar
- __Re-matching treatment__
- __AMT integration__

#### To-do Priority 2:
- Channel definition in packages.json is strange
- In case two games (minisvo + ultimatum) are present, node gets error from other game