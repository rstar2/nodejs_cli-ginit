const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const Spinner = require('clui').Spinner;

const spinner = new Spinner();

module.exports = {
    start: function (banner) {
        // clear the whole console
        clear();

        // log a fancy ASCII text banner
        console.log(chalk.yellow(figlet.textSync(banner, { horizontalLayout: 'full' })));
    },

    status: {
        start : function(message) {
            spinner.stop();
            spinner.message(message);
            spinner.start();
        },
        stop: function() {
            spinner.stop();
        }
    }
};



