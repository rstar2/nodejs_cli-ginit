#!/usr/bin/env node
// needed to make our command available globally using
//     $ npm link
// or  $ npm install -g
// This will also work on Windows, as npm will helpfully
// install a cmd wrapper alongside your script.

const path = require('path');
const { promisify } = require('util');

const chalk = require('chalk');
const clear = require('clear');
const CLI = require('clui');
const figlet = require('figlet');
const Spinner = CLI.Spinner;
const _ = require('lodash');
const git = require('simple-git')();
const touch = require('touch');

const utils = require('./lib/utils');
const github = require('./lib/github');

// START
// clear the whole console
clear();

// log a fancy ASCII text banner
console.log(
  chalk.yellow(
    figlet.textSync('Ginit', { horizontalLayout: 'full' })
  )
);

// check if a GIT repository already exists inside
if (utils.isDirExists('.gitX')) {
  console.log(chalk.red('Already a git repository!'));
  process.exit(1);
}

// get the name of the current working directory
const cwd = utils.getNameCWD();


// get user's GitHub credentials
github.getToken().then((token)=> {
  console.log(`Token : ${token}`)
}).catch(err => {
  console.log(chalk.red(`Failed - ${err} !`));
  process.exit(1);
});