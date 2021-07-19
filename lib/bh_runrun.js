const util = require('util');
const execMine = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');

module.exports = {
booom: async function (cmd) {
    // body...
    return await execMine(cmd)
},
boom: async function(cmd, id){
return new Promise(async function(resolve,reject){

console.log("wooooooow "+(id+1))

let myArr = []
let sgcmd = true
// check that this is a single command..
if(cmd.indexOf(" ")!==-1){
    sgcmd = false;
    myArr = cmd.split(" ");
}
let commandList = []

for(i=1;i<myArr.length;i++){
    commandList.push(myArr[i])
}
if(!sgcmd)cmd = myArr[0]

const ls = spawn(cmd,commandList);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

// ls.on('close', (code) => {
//   console.log(`child process close all stdio with code ${code}`);
// });

ls.on('exit', (code) => {
  console.log(`child process exited with code ${code}`);
});

return resolve(true)
})
}

}