const util = require('util');
const execMine = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');

module.exports = {
booom: async function (cmd) {
    // body...
    return await execMine(cmd)
},
boom: async function(cmd){
return new Promise(async function(resolve,reject){

console.log("wooooooow")
const ls = spawn(cmd);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
});

ls.on('exit', (code) => {
  console.log(`child process exited with code ${code}`);
});

return resolve(true)
})
}

}