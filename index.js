#!/usr/bin/env node

// needed to make our command available globally using
//     $ npm link
// or  $ npm install -g
// This will also work on Windows, as npm will helpfully
// install a cmd wrapper alongside your script.

/* eslint-disable no-console */

const chalk = require('chalk');
const minimist = require('minimist');


const guiStart = require('./lib/gui').start;
const utils = require('./lib/utils');
const github = require('./lib/github');
const git = require('./lib/git');


guiStart('Ginit');

// check if a GIT repository already exists inside
if (utils.isDirExists('.gitX')) {
    console.log(chalk.red('Already a git repository!'));
    process.exit(1);
}


function getRepoParams() {
    // Usage:
    // $ ginit name "Long Description"
    // get the main arguments (under the '_' param)
    let argv = minimist(process.argv.slice(2));
    argv = argv._;

    // get the name of the current working directory
    let name = utils.getNameCWD();
    let description;

    if (argv.length > 0) {
        name = argv[0];

        if (argv.length > 1) {
            description = argv[1];
        }
    }

    return { name, description };
}

// get user's GitHub credentials and the "new" Repository parameters
Promise.all([github.getToken(), getRepoParams()])
    .then(([token, repo]) => {
        console.log(`Token : ${token}`);
        console.log(`Repo : ${repo.name} - ${repo.description}`);
    })
    .catch(err => {
        console.log(chalk.red(`Failed - ${err} !`));
        process.exit(1);
    });