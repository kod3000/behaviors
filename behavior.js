const behaviors = require('./lib/bh_core.js');
var countSystemSleep = 0;

(async () => {
await behaviors.splash();
await behaviors.init();
do{
	// go thru each command 
	await behaviors.cycle();
}while(true)

process.exit();
})();