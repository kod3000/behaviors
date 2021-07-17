const behaviors = require('./lib/bh_core.js');

var countSystemSleep = 0;


(async () => {

console.log("\n\t\t\tStarting Up Behaviors")

behaviors.tt();

console.log("\n\t\t\tSupports : +days, +hrs, +mins\n\n")

behaviors.sysStartUp();

do{
// this needs its own function
// go thru each command ...



}while(true)
process.exit();
})();