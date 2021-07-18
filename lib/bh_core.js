const fs = require('fs');
var cmd = require('./bh_runrun.js');
var time = require('./bh_control.js');
var moment = require('moment'); // require

const tools = {
		qD:doesTheFileExist,
		gD:getTheData,
		wD:writeTheData,
		nap:napTime,
		pick:getRandomIntBetween,
		tt:time.time,
		min:time.addMinutes,
		day:time.addDays,
		rm:time.setRandomMinutes,
		rs:time.setRandomSeconds,
		run:cmd.run,
		processNextRun:time.nextRun,

    init:sysStartUp
		}

const working_file = "behaviors.json"; // global name of our behavoir file.

/////////////////////////////////
//
// System Start Up - Returns Behaviors Data
//
//  - checks/loads if a json file exist to work w/
//  - if not create one with default data
//  - return data so to continue
//
////////////////////////////////

async function sysStartUp(){
return new Promise(async function(resolve,reject){

let checkFile = await doesTheFileExist(working_file)
// setup our storage
var storageData = null;
if(checkFile){
  storageData = await getTheData(working_file)
}else{
  // setup dummy behaviors
  // after the json file is created you can modify or add to all you want.
  // refrence readme for more information

  await writeTheData(working_file,storageData);
}

});
}


async function createDummyData(){
return new Promise(async function(resolve,reject){


  let dummyData = [
                    {runTime: "'"+moment().add(2, 'days').format('MM-DD-YY HH:mm:ss')+"'"   ,cmd:"pwd",nextRun:{days:1,mins:'r',sec:'r'}}, // next run will be in 1 day (randomize seconds and minutes)
                    {runTime: "'"+moment().add(1, 'minutes').format('MM-DD-YY HH:mm:ss')+"'",cmd:"ls",nextRun:{mins:3}}, // next run will be in 3 minutes. (randomize seconds) 
                    {runTime: "'"+moment().add(20, 'seconds').format('MM-DD-YY HH:mm:ss')+"'",cmd:"echo 'hello!!!'"}, 
                    {runTime: "'"+moment().add(30, 'seconds').format('MM-DD-YY HH:mm:ss')+"'",cmd:"echo 'isn\'t it nice when computers do all the work!!!'"}, 
                    {runTime: "'"+moment().add(40, 'seconds').format('MM-DD-YY HH:mm:ss')+"'",cmd:"echo 'enjoy using behaviors.'"}, 
                    {runTime:'01-01-22 00:00:01',cmd:"echo 'happy new year world!!!'"}, 
                ]
  return resolve(dummyData);

})
}

async function behave(behaviors){
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

async function doesTheFileExist (name) {
return new Promise(function(resolve, reject) {
    try {
      if (fs.existsSync(name)) {
        return resolve(true);
      }else{
       return resolve(false);
      }
    } catch(err) {
      return resolve(false);
    }
});
}

async function getTheData (name){
  return new Promise(function(resolve, reject) {
      fs.readFile(name, 'utf8', function (err, data) {
        if (err) reject(err);
        dataExp = JSON.parse(data);
        return resolve(dataExp); 
    });
  });
}

async function writeTheData (name,data){
    return new Promise(function(resolve, reject) {
  fs.writeFile(name, JSON.stringify(data, null, 2), function (err) {
    if (err) return console.log(err);
    //console.log('wrote data to '+name+' file.');
    return resolve(true)
  });
});
}

async function napTime(milliseconds) {
return new Promise(async function(resolve, reject) {
  if(milliseconds == null){
    milliseconds = 2000;
  }
  // lets randomize this alittle..
  var padding = parseFloat(milliseconds*.35).toFixed(0); // get 35% of number
  milliseconds = await getRandomIntBetween((milliseconds-padding), parseFloat(milliseconds)+parseFloat(padding)) // padd number on both sides.
  //console.log("sleeping for "+milliseconds)
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
  return resolve(true)
});
}

async function getRandomIntBetween(min, max) {
  return new Promise(async function(resolve, reject) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return resolve(Math.floor(Math.random() * (max - min) + min)); //The maximum is exclusive and the minimum is inclusive
});
}

module.exports = tools