const control = require('./bh_control.js');
const cmd = require('./bh_runrun.js');
var moment = require('moment'); // require

const core = {
    init:sysStartUp,
    splash:splash,
    cycle:run,
		}



///////////////////////////////////////////////////
//
//  Splash Screen - 
//

async function splash(){
  return new Promise(async function(resolve,reject){
    console.log("\n\t\t\tStarting Up Behaviors")
    control.time();
    console.log("\n\t\t\tSupport : +days, +hrs, +mins\n\n")
    return resolve(true)
  })
}

//
///////////////////////////////////////////////////




///////////////////////////////////////////////////
//
//  System Start Up - Returns Behaviors Data
//
//  - checks/loads if a json file exist
//  - if not create one with dummy data
//

const working_file = "behaviors.json"; // global name of our json file.

async function sysStartUp(){
  return new Promise(async function(resolve,reject){
    let checkFile = await control.doesTheFileExist(working_file)
    if(checkFile){
      await control.setStorageData(await control.getTheData(working_file))
    }else{
      // create dummy data
      await control.setStorageData(await control.createDummyData());
      // after the json file is created you can modify it
      // reference the readme for more information
      await control.writeTheData(working_file, await control.getStorageData());
    }
    return resolve(true);
  });
}

//
//
///////////////////////////////////////////////////



///////////////////////////////////////////////////
//
// System Run 
//
//  - cycles between each command
//  - checks if a behavior needs to be run or not
//  - if the behavior runs .. update its next runTime
//
//

async function run(){
return new Promise(async function(resolve,reject){

let dataCycle = await control.getStorageData();

// cycle thru all of the listed behaviors
for(j=0;j<dataCycle.length;j++){
  let e = dataCycle[j];
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
    dataCycle[j]=e; // save what we have so far..
    await control.napTime(1000); // take a 10 second nap ..
    continue;
  }
  // commands are on the list to run from this point forward..
  if(timeCheck==0){
    console.log("\nfound date..\n")
    e.foundDate = true;
    cmd.run(e.cmd, function(e,d,s){
      //console.clear();
      if(e)console.log(e);
      if(s)console.log(s);
      console.log(d)
    })
  }
  // now check  checking ..
  if(timeExpired && e.nextRun!=null){
  // just in case we missed it...
  // if it ran past its due date and has a next run, reschedule it.
    await control.nextRun(e.runTime,e.nextRun).then( async d=>{
      // console.log(j+") is past its date \t\t\t["+moment(new Date(e.runTime)).fromNow() + "] \n")
      // first up if we past it awhile ago.. forget it..
      // check if we ran past our date without running our command 
      // if we past it less than a minute ago .. run it.
      if(e.foundDate==false && (Date.now()-new Date(e.runTime))<60000 ){
      // console.log("\n\n\nrunning command for the date..\n\n\n")
        cmd.run(e.cmd, function(e,d,s){
              console.log("\nfound it late but found it.. date..\n")
              if(e)console.log(e);
              if(s)console.log(s);
              console.log(d)
              control.napTime(5000)

            });
        await control.napTime(10000)
      }
      e.foundDate = false; // last set foundDate to false
      if(d!=e.runTime)e.runTime = moment(new Date(d)).format('MM-DD-YY HH:mm:ss');
      // console.log(j+") is now set for \t\t\t["+moment(new Date(e.runTime)).fromNow() + "]\n")
      let tmpdata = dataCycle;
      for(i=0;i<tmpdata.length;i++){
        delete tmpdata[i].foundDate
        delete tmpdata[i].waitForRun
      }
      await control.writeTheData(working_file,tmpdata);
      await control.napTime(5000)
      // we need to save our info with the new runTime
    })
  }
    dataCycle[j]=e; // save what we have so far..
    await control.napTime(1000); // take a quick nap ..   
  }

  return resolve(true);



})
}


module.exports = core