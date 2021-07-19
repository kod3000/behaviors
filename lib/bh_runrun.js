const { exec, execSync } = require('child_process'); 


const util = require('util');
const execMine = util.promisify(require('child_process').exec);

module.exports = {
run:function (command,callback){
    
    return exec(
        command,
        (
            function(){
                return function(err,data,stderr){
                    if(!callback)
                        return;

                    callback(err, data, stderr);
                }
            }
        )(callback)
    );
},
runSync:function (command){
    try {
        return { 
            data:   execSync(command).toString(), 
            err:    null, 
            stderr: null 
        }
    } 
    catch (error) {
        return { 
            data:   null, 
            err:    error.stderr.toString(), 
            stderr: error.stderr.toString() 
        }
    }
},
booom: async function (cmd) {
    // body...
    return await execMine(cmd)
}

}