const control = require('./bh_control.js');

var cmd = require('./bh_runrun.js');
var moment = require('moment'); // require

const core = {
    init:sysStartUp,
    splash:splash,
		}

const working_file = "behaviors.json"; // global name of our behavoir file.

async function splash(){
  return new Promise(async function(resolve,reject){
    console.log("\n\t\t\tStarting Up Behaviors")
    control.time();
    console.log("\n\t\t\tSupports : +days, +hrs, +mins\n\n")
    return resolve(true)
  })
}



///////////////////////////////////////////////////
//
//  System Start Up - Returns Behaviors Data
//
//  - checks/loads if a json file exist
//  - if not create one with dummy data
//
async function sysStartUp(){
  return new Promise(async function(resolve,reject){
    let checkFile = await doesTheFileExist(working_file)
    if(checkFile){
      await control.setStorageData(await getTheData(working_file))
    }else{
      // create dummy data
      await control.setStorageData(await control.createDummyData());
      // after the json file is created you can modify it
      // reference the readme for more information
      await writeTheData(working_file, await control.getStorageData());
    }
  });
}
//
//
//
///////////////////////////////////////////////




async function runBehave(){
return new Promise(async function(resolve,reject){

// cycle thru all of the listed behaviors
for(j=0;j<behaviors.length;j++){
  let e = behaviors[j];
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
    behaviors[j]=e; // save what we have so far..
    await tools.nap(1000); // take a 10 second nap ..
    continue;
  }
  // commands are on the list to run from this point forward..
  if(timeCheck==0){
    console.log("\nfound date..\n")
    e.foundDate = true;
    tools.run(e.cmd, function(e,d,s){
      console.clear();
      if(e)console.log(e);
      if(s)console.log(s);
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
      let tmpdata = behaviors;
      for(i=0;i<tmpdata.length;i++){
        delete tmpdata[i].foundDate
        delete tmpdata[i].waitForRun
      }
      await writeTheData(working_file,tmpdata);
      await napTime(5000)
      // we need to save our info with the new runTime
    })
  }
    storageData[j]=e; // save what we have so far..
    await tools.nap(1000); // take a quick nap ..   
  }


})
}


module.exports = core