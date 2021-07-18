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
//  NOTE THIS CAN BE MADE CLEANER

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
          e.foundDate = true
          if(timeExpired==false)e.foundDate = false;
          // time expired and this value has no instructions for another run then dont wait..
          if(timeExpired && e.nextRun == null)e.waitForRun=false
        }
        if(e.waitForRun==false){
          dataCycle[j]=e; 
          continue;
        }
        // 
        if(timeExpired && !e.foundDate && e.waitForRun){
          e.foundDate = true;
          cmd.run(e.cmd, async function(e,d,s){
            //console.clear();
            if(e)console.log(e);
            if(s)console.log(s);
            // console.log(d)
            await control.log(d);
          })
        }
        // now double check 
        // just in case we missed it
        if(timeExpired){
          // check only behaviors that are one time runs
          if(e.nextRun==null && e.foundDate==false && (Date.now()-new Date(e.runTime))<60000 ){
              e.foundDate = true;
              cmd.run(e.cmd, async function(e,d,s){
                  //console.clear();
                  if(e)console.log(e);
                  if(s)console.log(s);
                  // console.log(d)
                  await control.log(d);
              })
          }
        // check behaviors that are set on repeat
        if(e.nextRun!=null){
          // reschedule the next run
          await control.nextRun(e.runTime,e.nextRun).then( async d=>{
            // if we past it less than a minute ago 
            // and still haven't ran it, lets put it to run
            if(e.foundDate==false && (Date.now()-new Date(e.runTime))<60000 ){
              e.foundDate = true;
              cmd.run(e.cmd, async function(e,d,s){
                  if(e)console.log(e);
                  if(s)console.log(s);
                  // console.log(d)
                  await control.log(d);
              })
            }
            e.foundDate = false; // set foundDate back to false
            if(d!=e.runTime){
              // update only if the runTimechanges..
              e.runTime = moment(new Date(d)).format('MM-DD-YY HH:mm:ss');
              let tmpdata = dataCycle;
              for(i=0;i<tmpdata.length;i++){
                delete tmpdata[i].foundDate
                delete tmpdata[i].waitForRun
              }
              await control.writeTheData(working_file,tmpdata); // update new runTime on json file
            }
          })
          }
        }
        dataCycle[j]=e; // save what we have so far..
      }
      
      return resolve(true);
})
}

//
//
///////////////////////////////////////////////////


module.exports = core