const util = require('util');
const execMine = util.promisify(require('child_process').exec);

module.exports = {
booom: async function (cmd) {
    // body...
    return await execMine(cmd)
}

}