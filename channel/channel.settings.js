/**
 * # Channels definition file for Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Configurations options for channel.
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    alias: 'ms1',

    playerServer: 'minisvo',

    adminServer: 'minisvo/admin',

    sioQuery: false,

    verbosity: 0,

    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true,

    // Unauthorized clients will be redirected here.
    // (defaults: "/pages/accessdenied.htm")
    accessDeniedUrl: '/minisvo/unauth.htm',

    enableReconnections: false
};

