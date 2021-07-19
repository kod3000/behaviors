var moment = require('moment'); // require
const fs = require('fs');


let storageData = null;

module.exports = {
    log:async function(d,n){
    return new Promise(function(resolve, reject) {
    fs.appendFile('log.txt', d, function (err) {
      if (err) throw err;
          console.log('log entry ['+moment().format('MMM Do, h:mm:ss a')+'] entered. relating to behavior number ['+n+']');
          return resolve(true); 
      });
    });
    },
    doesTheFileExist:async function(name) {
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
    },
    getTheData:async function(name){
      return new Promise(function(resolve, reject) {
            fs.readFile(name, 'utf8', function (err, data) {
              if (err) reject(err);
              try{
                dataExp = JSON.parse(data)
              }catch(err){
                console.log("no data inside the json file.. we should recreate it using dummy.")
                process.exit();
              }
              
              return resolve(dataExp); 
          });
      });
    },
    writeTheData:async function(name,data){
      return new Promise(function(resolve, reject) {
        fs.writeFile(name, JSON.stringify(data, null, 2), function (err) {
          if (err) return console.log(err);
          return resolve(true)
        });
      });
    },
    createDummyData:async function(){
      return new Promise(async function(resolve,reject){
      // setup dummy behaviors
        let dummyData = [
                          {runTime: moment().add(2, 'days').format('MM-DD-YY HH:mm:ss') ,cmd:"pwd",nextRun:{days:1,mins:'r',sec:'r'}}, // next run will be in 1 day (randomize seconds and minutes)
                          {runTime: moment().add(2, 'minutes').format('MM-DD-YY HH:mm:ss'),cmd:"ls",nextRun:{mins:3}}, // next run will be in 3 minutes. (randomize seconds) 
                          {runTime: moment().add(20, 'seconds').format('MM-DD-YY HH:mm:ss'),cmd:"pwd"}, 
                          {runTime: moment().add(40, 'seconds').format('MM-DD-YY HH:mm:ss'),cmd:"which node"}, 
                          {runTime: moment().add(60, 'seconds').format('MM-DD-YY HH:mm:ss'),cmd:"ls"}, 
                          
                          {runTime: moment().add(20, 'seconds').format('MM-DD-YY HH:mm:ss'),cmd:"echo 'hello!!!'"}, 
                          {runTime: moment().add(60, 'seconds').format('MM-DD-YY HH:mm:ss'),cmd:"echo 'what what!!!'"}, 
                          // {runTime: moment().add(30, 'seconds').format('MM-DD-YY HH:mm:ss'),cmd:"echo 'its nice when computers do all the work!!!'"}, 
                          // {runTime: moment().add(40, 'seconds').format('MM-DD-YY HH:mm:ss'),cmd:"echo 'enjoy using behaviors.'"}, 
                          {runTime:'01-01-22 00:00:01',cmd:"echo 'happy new year world!!!'"}, 
                      ]
        return resolve(dummyData);

      })
    },
    setStorageData:async function(d){
      return new Promise(async function(resolve,reject){
        storageData = d;
        return resolve(storageData);
      })
    },
    getStorageData:async function(d){
      return new Promise(async function(resolve,reject){
        return resolve(storageData);
      })
    },
    pick:async function (min, max) {
      return new Promise(async function(resolve, reject) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return resolve(Math.floor(Math.random() * (max - min) + min)); //The maximum is exclusive and the minimum is inclusive
    });
    },
    napTime:async function(milliseconds) {
      return new Promise(async function(resolve, reject) {
        if(milliseconds == null){
          milliseconds = 2000;
        }
        // lets randomize this alittle..
        var padding = parseFloat(milliseconds*.35).toFixed(0); // get 35% of number
        milliseconds = await module.exports.pick((milliseconds-padding), parseFloat(milliseconds)+parseFloat(padding)) // padd number on both sides.
        //console.log("sleeping for "+milliseconds)
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
        return resolve(true)
      });
    },
    time:function(){
      console.log("\n\t\t\t["+moment().format('MMM Do, h:mm:ss a') + "]\n")
    },
    //////////////////////////////////////////////////////////////////////////////////////////
    //
    //  nextRun (original_date [date object], instruction_set [object] )
    //
    //  This function makes the changes to 'runTime' according to the instruction set.
    //
    //////////////////////////////////////////////////////////////////////////////////////////
    nextRun: async function(o, i){
    return new Promise(async function(resolve,reject){
          let tmpTime = new Date(o)
          if(i.days!=null){
            // add days..
            o = await module.exports.addDays(tmpTime, parseFloat(i.days))
          }
          if(i.mins!=null){
            // minutes.. random or add
            tmpTime = new Date(o)
            if(i.mins == 'r'){
              o = await module.exports.setRandomMinutes(tmpTime)
            }else{
              o = await module.exports.addMinutes(tmpTime, parseFloat(i.mins))
            }
          }
          if(i.hrs!=null){
            // hours.. random or add
            tmpTime = new Date(o)
            if(i.hrs == 'r'){
              o = await module.exports.setRandomHours(tmpTime)
            }else{
              o = await module.exports.addHours(tmpTime, parseFloat(i.hrs))
            }
          }
          if(i.sec!=null && i.sec == 'r'){
            tmpTime = new Date(o)
            // set random seconds..
            o = await module.exports.setRandomSeconds(tmpTime)
          }
          return resolve(o)
    });
    },
    addMinutes: async function (time, minutes){
      return new Promise(async function(resolve, reject) {
        var tmp = new Date(time);
        tmp.setMinutes(time.getMinutes() + minutes)
        return resolve(tmp);
      })
    },
    addHours: async function (time, hours){
      return new Promise(async function(resolve, reject) {
        var tmp = new Date(time);
        tmp.setHours(time.getHours() + hours)
        return resolve(tmp);
      })
    },
    addDays:async function (time, days){
      return new Promise(async function(resolve, reject) {
        var tmp = new Date(time);
        //console.log(time.getDate())
        tmp.setDate(time.getDate() + days)
        //console.log(tmp.getDate())
        return resolve(tmp);
      })
    },
    setRandomHours:async function  (time) {
      return new Promise(async function(resolve, reject) {
        let tmp = new Date(time)
        let low = tmp.getHours();
        if(low >20)low=0;
        return resolve(tmp.setHours(await module.exports.pick(low,23)))
      });
    },
    setRandomSeconds:async function  (time) {
      return new Promise(async function(resolve, reject) {
        let tmp = new Date(time)
        return resolve(tmp.setSeconds(await module.exports.pick(0,59)))
      });
    },
    setRandomMinutes:async function  (time, s, e) {
      return new Promise(async function(resolve, reject) {
        if(s==null)s=0;
        if(e==null || e>=60)e=59;
        let tmp = new Date(time)
        return resolve(tmp.setMinutes(await module.exports.pick(s,e)))
      });
    }
}