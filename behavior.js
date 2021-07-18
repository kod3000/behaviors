const behaviors = require('./lib/bh_core.js');

var countSystemSleep = 0;


(async () => {
await behaviors.splash();

await behaviors.init();

do{
// this needs its own function
// go thru each command ...

}while(true)
process.exit();
})();