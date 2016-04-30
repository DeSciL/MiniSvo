/**
 * Standard Waiting Room settings.
 */
module.exports = {

    // How many clients must connect before groups are formed.
    POOL_SIZE: 2,

    // The size of each group.
    GROUP_SIZE: 2,

    // Maximum waiting time.
    MAX_WAIT_TIME: 6000,

    // Treatment assigned to groups.
    // If left undefined, a random treatment will be selected.
    // Use "treatment_rotate" for rotating the treatments.
    CHOSEN_TREATMENT: 'treatment_rotate',

    ON_TIMEOUT: function(data) {
        var timeOut;

        // Enough Time passed, not enough players connected.
        if (data.over === 'Time elapsed!!!') {
            
            timeOut = "<h2>Not enough players</h2>" 
            
            
            timeOut += "<p align='center'>Thank you for your patience.<br />";
            timeOut += "Unfortunately, there are not enough participants in ";
            timeOut += "your group to start the experiment.<br />";
               
        }

        // Too much time passed, but no message from server received.
        else {
            timeOut = "An error has occurred. You seem to be ";
            timeOut += "waiting for too long. Please look for a HIT called ";
            timeOut += "<strong>ETH Descil Trouble Ticket</strong> and file ";
            timeOut += "a new trouble ticket reporting your experience."
        }

        if (data.exit) {
            timeOut += "<br />Please submit the HIT using the following ExitCode:<br />" + data.exit;
        }

        timeOut += "<br /></p>";

        this.bodyDiv.innerHTML = timeOut;
    } 
};