const fs = require('fs');
const EOL = require('os').EOL;
const { promisify } = require('util');

const inquirer = require('inquirer');
const git = require('cmd-executor').git;
const touch = require('touch');

require('./promise');

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

    let gitignore$;
    if (!filesChoice.length) {
        gitignore$ = touch(file);
    } else {
        gitignore$ = inquirer.prompt(
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
        });
    }
    return gitignore$.then(() => Promise.resolve());
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
function setup(remoteRepoUrl) {
    guiStatus.start('Setting up the repository...');

    return _setup(remoteRepoUrl)
        .always(guiStatus.stop)
        .then(() => Promise.resolve());
}

/**
 * 
 * @param {String} remoteRepoUrl 
 * @returns {Promise}
 */
async function _setup(remoteRepoUrl) {
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
    return git.push('-u origin master');
}

module.exports = {
    createGitignore,
    setup
};

