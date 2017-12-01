const os = require('os');

const inquirer = require('inquirer');
const moment = require('moment');

const Preferences = require('preferences');
const GitHubApi = require('github');

require('./promise');
const guiStatus = require('./gui').status;

const GITHUB_ACCESS_TOKEN_NAME = 'ginit - CLI tool on ' + os.hostname() +
    ' at ' + moment().format('YYYY-MM-DD h:mm:ss a');

const api = new GitHubApi({
    version: '3.0.0'
});

const prefs = new Preferences('ginit');

/**
 * Get credentials.
 * Wrapped in a promise.
 * @return {Promise<{username:String, password:String}>}
 */
function getCredentials() {
    const questions = [
        {
            name: 'username',
            type: 'input',
            message: 'Enter your Github username or e-mail address:',
            validate: function (value) {
                if (value.length) {
                    return true;
                }
                return 'Please enter your username or e-mail address';
            }
        },
        {
            name: 'password',
            type: 'password',
            message: 'Enter your password:',
            validate: function (value) {
                if (value.length) {
                    return true;
                }
                return 'Please enter your password';
            }
        }
    ];

    return inquirer.prompt(questions);
}

/**
 * Get Token.
 * Wrapped in a promise.
 * @return {Promise<String>}
 */
function getToken() {
    // check if the token is already stored in
    // a user preferences object (depending on the OS , user and etc..)
    if (prefs.github && prefs.github.token) {
        return Promise.resolve(prefs.github.token);
    }

    // get credentials now
    // get/exchange token
    // store token
    // return token
    return getCredentials()
        .then(credentials => {
            guiStatus.start('Authenticating you, please wait...');

            // first authenticate with the credentials
            api.authenticate({ type: 'basic', ...credentials });

            // then get an access token
            const data = {
                scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                note: GITHUB_ACCESS_TOKEN_NAME
            };
            return api.authorization.create(data);
        })
        .catch(error => {
            // invalidate the prefs object if for some reason there's error authenticating
            delete prefs.github;
            throw error;
        })
        .always(guiStatus.stop)
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

function authenticate() {
    return getToken()
        .then(token => {
            return api.authenticate({ type: 'oauth', token });
        });
}

/**
 * Create a GitHub repository.
 * Wrapped in a promise.
 * @return {Promise<String>}
 */
function createRepo(name, description = null, sshUrl = true) {
    const questions = [
        {
            type: 'input',
            name: 'name',
            message: 'Enter a name for the repository:',
            default: name,
            validate: function (value) {
                if (value.length) {
                    return true;
                }
                return 'Please enter a name for the repository';
            }
        },
        {
            type: 'input',
            name: 'description',
            default: description,
            message: 'Optionally enter a description of the repository:'
        },
        {
            type: 'list',
            name: 'visibility',
            message: 'Public or private:',
            choices: ['public', 'private'],
            default: 'public'
        }
    ];

    return inquirer.prompt(questions)
        .then(answers => {
            guiStatus.start('Creating repository...');

            const data = {
                name: answers.name,
                description: answers.description,
                private: (answers.visibility === 'private')
            };
            return api.repos.create(data);
        })
        .always(guiStatus.stop)
        .then(response => response.data)
        .then(data => sshUrl ? data.ssh_url : data.clone_url);
}


module.exports = {
    authenticate,
    createRepo
};