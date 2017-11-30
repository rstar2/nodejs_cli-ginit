const fs = require('fs');
const EOL = require('os').EOL;
const { promisify } = require('util');

const inquirer = require('inquirer');
const git = require('cmd-executor').git;
const touch = require('touch');

const guiStatus = require('./gui').status;

const SKIP_CHOICES = ['.git', '.gitignore'];
const GITIGNORE_DEFAULTS = ['node_modules', 'bower_components', '.vscode'];

/**
 * Create a '.gitignore' file
 * @return {Promise<void>} always a resolve promise
 */
function createGitignore(file = '.gitignore') {
    const filesAll = fs.readdirSync('.');
    const filesChoice = filesAll.filter(name => SKIP_CHOICES.indexOf(name) === -1);

    const success = Promise.resolve();

    if (!filesChoice.length) {
        return success;
    }

    return inquirer.prompt(
        [
            {
                type: 'checkbox',
                name: 'ignore',
                message: 'Select the files and/or folders you wish to ignore:',
                choices: filesChoice,
                default: GITIGNORE_DEFAULTS
            }
        ]
    ).then(answers => {
        if (answers.ignore.length) {
            return promisify(fs.writeFile)(file, answers.ignore.join(EOL));
        }
        return touch(file);
    }).then(() => success);
}

/**
 * Setup a local GIT repository:
 * 1. Run                            -> 'git init'
 * 2. Create '.gitignore'
 * 3. Add all                        -> 'git add .'
 * 4. Perform initial commit         -> 'git commit -m "creation"'
 * 5. Add a remote repository        -> 'git remote add origin xxxx'
 * 6. Push the changes to the remote -> 'git push -u origin master'
 * 
 * @param {String} remoteRepoUrl
 * @return {Promise<void>}
 */
async function setup(remoteRepoUrl) {
    guiStatus.start('Setting up the repository...');

    // will run `git init`  
    await git.init();

    // will run `git add .`
    await git.add('.');

    // will run `git commit -m "initial commit"`  
    await git.commit('-m "creation"');

    // will run `git remote add origin remoteRepoUrl` 
    await git.remote.add('origin', remoteRepoUrl);

    // will run `git push -u origin master` 
    await git.push('-u origin master')
        // mimic a simple 'always' clause
        .catch(err => {
            guiStatus.stop();
            throw err;
        })
        .then(response => {
            guiStatus.stop();
            return response;
        });
}

module.exports = {
    createGitignore,
    setup
};

