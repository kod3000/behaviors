const fs = require('fs');
var cmd = require('./bh_runrun.js');
var time = require('./bh_time.js');

const tools = {
		qD:doesTheFileExist,
		gD:getTheData,
		wD:writeTheData,
		nap:napTime,
		pick:getRandomIntBetween,
		tt:time.tt,
		min:time.addMinutes,
		day:time.addDays,
		rm:time.setRandomMinutes,
		rs:time.setRandomSeconds,
		run:cmd.run,
		processNextRun:time.nextRun
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