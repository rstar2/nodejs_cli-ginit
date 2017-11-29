# Create a simple NodeJS CLI program following the tutorial from https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/

# Here’s a complete list of the packages we’ll use specifically for developing on the command-line:

- **chalk** – colorizes the output
- **clear** – clears the terminal screen
- **clui** – draws command line tables, gauges and spinners
- **figlet** – creates ASCII art from text
- **inquirer** – creates interactive command line user interface
- **minimist** – parses command-line argument options
- **preferences** – manage CLI application encrypted preferences

## Additionally, we’ll also be using the following:

- **github** – Node wrapper for the GitHub API
- **lodash** – JavaScript utility library
- **simple-git** – runs Git commands in a Node.js application
- **touch** – implementation of the *Nix touch command

# What will actually **ginit** do:

- Initialize the local repository by running git init
- Create a remote repository, for example on Github or Bitbucket; typically by leaving the command-line and firing up a web browser
- Add the remote
- Create a .gitignore file
- Add your project files
- Commit the initial set of files
- Push up to the remote repository