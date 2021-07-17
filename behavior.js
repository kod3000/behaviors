var moment = require('moment'); // require
var tools = require('./lib/bh_core.js');

var countSystemSleep = 0;
const behave = "behaviors.json"; // global name of our behavoir file.


(async () => {

console.log("\n\t\t\tStarting Up Behaviors")

tools.tt();

console.log("\n\t\t\tSupports : +days, +hrs, +mins")


// check if we have our behave json file
let checkFile = await tools.qD(behave)
// setup our storage
var storageData = null;
if(checkFile){
  // use the exisiting file..
  storageData = await tools.gD(behave)
}else{
  // no file found.. lets create a test one to modify
  storageData = [
                    {runTime:'07-17-21 13:38:13',cmd:"pwd",nextRun:{days:1,mins:'r',sec:'r'}}, // next run will be in 1 day (randomize seconds and minutes)
                    {runTime:'07-16-21 07:18:13',cmd:"ls",nextRun:{mins:3}}, // next run will be in 3 minutes. (randomize seconds) 
                    {runTime:'01-01-22 00:00:01',cmd:"echo 'happy new year world!!!'"}, // not going to rerun
                ]
  await tools.wD(behave,storageData);
}

do{
// MOvE THIS ENTIRE THING INTO ITS OWN FUNCTION!!
// go thru each command ...
for(j=0;j<storageData.length;j++){
  let e = storageData[j];
  // check our dates given 
  let timeCheck = Date.now()-new Date(e.runTime)
  let timeExpired = timeCheck>0
  // on the first run we make sure to register the values as waiting/known..
  // make sure the command hasn't run yet.
  if(e.waitForRun == null){
    // default value is true..
    e.waitForRun = true
    if(timeExpired==false)e.foundDate = false;
    // time expired and this value has no instructions for another run then dont wait..
    if(timeExpired && e.nextRun == null)e.waitForRun=false
  }
  if(e.waitForRun==false){
    storageData[j]=e; // save what we have so far..
    await tools.nap(1000); // take a 10 second nap ..
    continue;
  }
  // commands are on the list to run from this point forward..
  if(timeCheck==0){
    console.log("\nfound date..\n")
    e.foundDate = true;
    tools.run(e.cmd, function(e,d,s){
      if(e)console.error(e);
      if(s)console.error(s);
      console.log(d)
    })
  }
  // now check  checking ..
  if(timeExpired && e.nextRun!=null){
  // just in case we missed it...
  // if it ran past its due date and has a next run, reschedule it.
    await tools.processNextRun(e.runTime,e.nextRun).then( async d=>{
      // console.log(j+") is past its date \t\t\t["+moment(new Date(e.runTime)).fromNow() + "] \n")
      // first up if we past it awhile ago.. forget it..
      // check if we ran past our date without running our command 
      // if we past it less than a minute ago .. run it.
      if(e.foundDate==false && (Date.now()-new Date(e.runTime))<60000 ){
      // console.log("\n\n\nrunning command for the date..\n\n\n")
        tools.run(e.cmd, async function(e,d,s){
              console.log(d)
              await tools.nap(5000)
            });
        await tools.nap(10000)
      }
      e.foundDate = false; // last set foundDate to false
      if(d!=e.runTime)e.runTime = moment(new Date(d)).format('MM-DD-YY HH:mm:ss');
      // console.log(j+") is now set for \t\t\t["+moment(new Date(e.runTime)).fromNow() + "]\n")
      let tmpdata = storageData;
      for(i=0;i<tmpdata.length;i++){
        delete tmpdata[i].foundDate
        delete tmpdata[i].waitForRun
      }
      await tools.wD(behave,tmpdata);
      await tools.nap(5000)
      // we need to save our info with the new runTime
    })
  }
    storageData[j]=e; // save what we have so far..
    await tools.nap(1000); // take a quick nap ..   
  }
}while(true)
process.exit();
})();