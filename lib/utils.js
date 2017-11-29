const fs = require('fs');
const path = require('path');

/**
     * Get the name of the current working directory (CWD)
     */
function getNameCWD() {
    return path.basename(process.cwd());
}

/**
  * Check if a passe path is an existing directory
  * @param {String} path
  */
function isDirExists(path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (err) {
        return false;
    }
}

module.exports = { 
    getNameCWD, 
    isDirExists, 
};