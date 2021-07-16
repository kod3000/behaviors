var moment = require('moment'); // require

var tools = require('./tools.js');

module.exports = {
pick:async function (min, max) {
  return new Promise(async function(resolve, reject) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return resolve(Math.floor(Math.random() * (max - min) + min)); //The maximum is exclusive and the minimum is inclusive
});
},
time:function(){
  console.log("\n\t\t\t["+moment().format('MMM Do, h:mm:ss a') + "]\n")
},
nextRun: async function(o, i){
return new Promise(async function(resolve,reject){
let tmpTime = new Date(o)
if(i.days!=null){
  // this is asking to add days..
  o = await module.exports.addDays(tmpTime, parseFloat(i.days))
}
if(i.mins!=null){
  // this is asking to add days..
  tmpTime = new Date(o)
  if(i.mins == 'r'){
    o = await module.exports.setRandomMinutes(tmpTime)
  }else{
    o = await module.exports.addMinutes(tmpTime, parseFloat(i.mins))
  }
}
if(i.sec!=null && i.sec == 'r'){
  tmpTime = new Date(o)
  // this is asking to add days..
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
addDays:async function (time, days){
  return new Promise(async function(resolve, reject) {

  var tmp = new Date(time);
  console.log(time.getDate())
  tmp.setDate(time.getDate() + days)
    console.log(tmp.getDate())
  return resolve(tmp);
})
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