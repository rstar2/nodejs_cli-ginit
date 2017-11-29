const inquirer = require('inquirer');
const Preferences = require('preferences');
const GitHubApi = require('github');

const api = new GitHubApi({
    version: '3.0.0'
});

const prefs = new Preferences('ginit');

/**
 * Get credentials wrapped in a promise.
 * @return {Promise<{username:String, password:String}>}
 */
function getCredentials() {
    var questions = [
        {
            name: 'username',
            type: 'input',
            message: 'Enter your Github username or e-mail address:',
            validate: function (value) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your username or e-mail address';
                }
            }
        },
        {
            name: 'password',
            type: 'password',
            message: 'Enter your password:',
            validate: function (value) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your password';
                }
            }
        }
    ];

    return inquirer.prompt(questions);
}

/**
 * Get Token wrapped in a promise.
 * @return {Promise<String>}
 */
function getToken() {

    // check if the token is already stored in
    // a user preferences object (depending on the OS , user and etc..)
    if (prefs.github && prefs.github.token) {
        return Promise.resolve(prefs.github.token);
    } else {
        // get credentials now
        // get/exchange token
        // store token
        // return token
        return getCredentials()
            .then(credentials => {
                // first authenticate with the credentials
                api.authenticate({ ...credentials, type: 'basic' });

                // then get an access token
                return api.authorization.create({
                    scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                    note: 'ginit, CLI tool for initalizing Git repositories'
                });
            })
            .then(response => response.data)
            .then(data => data.token)
            .then(token => {
                if (token) {
                    // store it in a preference cache
                    prefs.github = { token };
                }
                return token;
            });
    }

}

module.exports = {
    getToken
};