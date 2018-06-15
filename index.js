#!/usr/bin/env node

// needed to make our command available globally using
//     $ npm link
// or  $ npm install -g
// This will also work on Windows, as npm will helpfully
// install a cmd wrapper alongside your script.

const chalk = require('chalk');

const guiStart = require('./lib/gui').start;
const utils = require('./lib/utils');
const github = require('./lib/github');
const git = require('./lib/git');


guiStart('Ginit');

// check if a GIT repository already exists inside
if (utils.isDirExists('.git')) {
    console.log(chalk.red('Already a git repository!'));
    process.exit(1);
}


/**
 * @returns {{name:String, description?:String}}
 */
function getRepoParams() {
    // Usage:
    // $ ginit name "Long Description" --no-ssh

    let argv = require('minimist')(process.argv.slice(2));

    // get the name of the current working directory
    const name = argv._[0] || utils.getNameCWD();
    const description = argv._[1];
    const ssh = argv['ssh'];
    return { name, description, ssh };
}

// get user's GitHub credentials and the "new" Repository parameters
github.authenticate()
    .then(() => getRepoParams())
    .then(repoParams => github.createRepo(repoParams.name, repoParams.description, repoParams.ssh))
    .then(repoUrl => git.createGitignore().then(() => git.setup(repoUrl)))
    .catch(err => {
        console.log(chalk.red(`Failed - ${err} !`));
        process.exit(1);
    })
    .then(() => console.log(chalk.blue('Success!')));