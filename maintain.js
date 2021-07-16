// *********** *********** *********** *********** *********** *********** ***********//
//
//______  ___      _____       _____       _____          ________        
//___   |/  /_____ ___(_)________  /______ ___(_)______   ______(_)_______
//__  /|_/ /_  __ `/_  /__  __ \  __/  __ `/_  /__  __ \  _____  /__  ___/
//_  /  / / / /_/ /_  / _  / / / /_ / /_/ /_  / _  / / /______  / _(__  ) 
///_/  /_/  \__,_/ /_/  /_/ /_/\__/ \__,_/ /_/  /_/ /_/_(_)__  /  /____/  
//                                                      /___/   
//
// version 3.8
// this script allows for automatic commit and uploads to the gitserver.
// it must be in the root folder of the git folder project to work.
// *********** *********** *********** *********** *********** *********** ***********//

// install missing modules automatically on startup 
(function () {
  var r = require
  require = function (n) {
    try {
      return r(n)
    } catch (e) {
      console.log(`Module "${n}" was not found and will be installed`)
      r('child_process').exec(`npm i ${n}`, function (err, body) {
        if (err) {
          console.log(`Module "${n}" could not be installed. Try again or install manually`)
          console.log(body)
          exit(1)
        } else {
          console.log(`Module "${n}" was installed. Will try to require again`)
          try{
            return r(n)
          } catch (e) {
            console.log(`Module "${n}" could not be required. Please restart the app`)
            console.log(e)
            exit(1)
          }
        }
      })
    }
  }
})()
// end install missing modules

// regular app start
const notifier = require('node-notifier');
var cmd = require('node-cmd');
var moment = require('moment');
var path = require('path');
// end npm modules

// begin install snippet safety
// verify cmd is in place before continuing..
if(cmd == null){
  console.log("\n\nNote :\tThis must run on the root folder of the git project.\n");
  console.log("\tAll Missing modules should have installed automatically.\n\n\tPlease restart the nodejs script.\n\n");
  process.exit(1);
}
// end install snippet safety
//

// set empty false globals
var projectLocation = false;
var projectName = false;
let numOfAutoCommits = 0; // default counter for auto commits performed.
let pullCount = 0; // count the number of pulls made
var commitAutoMessage = 'Auto Commit'; // commit message the system will set each time.


// these two control the pace of the commits.
// if you want it to go naturally :
//  default settings are :
//          - fileChangeTolerance = 10
//          - allowedGlobalTime = 300000
//  overdrive settings are :
//          - fileChangeTolerance = 0
//          - allowedGlobalTime = 20000

const fileChangeTolerance = 0; // number of files changes to tolerate before making a commit
const allowedGlobalTime = 20000; // time in seconds allowed to use globally.
const timeBetweenPushes = 2; // time in minutes to wait till next auto push.. you can set this to 0 so to go overdrive.


// osx tool for notifying 
function tools_Message(txt,title,pic,tmOut){
  if(title == null)title="[ Maintain.js ]";
  if(tmOut == null || isNAN(tmOut))tmOut = false;
  var nc_qk = new notifier.NotificationCenter();
  nc_qk.notify({
   title: title,
   message: txt,
   sound: 'Ping',
   timeout: tmOut,
   //icon: path.join(__dirname, 'logo.png'), // if you want to display a logo
   //contentImage: pic, // pass in a image url for giggles..
 });
}

// main function for app 
// checks for files changed in project folder.. 
// if more than x files change perform commit .. 
// else perform commit every 5 mins
function performMaintenceOnProject(){
  console.log(cmd);
  console.log(cmd == null);

 cmd.get('git whatchanged -1 --format=oneline | tail -n +2 | wc -l',function(err, data, stderr){
  if(data){

      if(parseFloat(data.trim()) >= fileChangeTolerance){
        // if the files that have changed exceed fileChangeTolerance then auto commit and push.
        cmd.get('git add -A && git commit -m "'+commitAutoMessage+'" && git push origin ',function(error, data, standarderr){
          if(data.trim().indexOf('completed with') !== -1){
                numOfAutoCommits++; // only count commits that are positive.
          }
        });
        setTimeout( async function(){
          console.clear();
          await getDateOfLastCommit().then((msg)=>{ consoleGUI(msg); }); // show console message.
        },(allowedGlobalTime/10));// run after 30 secs

      }
      // this command will check how long was the last commit..
      cmd.get('git log -1 --format=%cd',function(error, someData, standarderr){
        if(someData){
          var date = moment(); // current date
          var tmpDate = new Date(someData.trim()); // date of last known commit
          // check if the last commit was more than 5 mins ago.
          if(Math.round(parseFloat(moment.duration(date.diff(tmpDate)).asMinutes())) > timeBetweenPushes){
            //  if 5mins have passed we have changes.. so we create autocommit.
            cmd.get('git add -A && git commit -m "'+commitAutoMessage+'" && git push origin ',function(error, data, standarderr){
          if(data.trim().indexOf('completed with') !== -1){
                numOfAutoCommits++; // only count commits that are positive.
              }
            });
            setTimeout( async function(){
               console.clear();
               await getDateOfLastCommit().then((msg)=>{ consoleGUI(msg); }); // show console message.
            },(allowedGlobalTime/10));// run after 30 secs
          }
        }
      });
    }
  });
}

//
async function getNameOfRepo(){
  return new Promise((resolve, reject) => {
    var commandToUse = "basename -s .git `git config --get remote.origin.url`"
    cmd.get(commandToUse,function(err, data, stderr){
      if(err)reject("Failed to get name of branch");
      if(data){
        resolve(data.trim());
      }
    });
  });
}
//
async function getDateOfLastCommit(){
  return new Promise((resolve, reject) => {
    var commandToUse = "git log -1 --format=%cd"
    cmd.get(commandToUse,function(err, data, stderr){
      if(err)reject("Failed to get date of last commit");
      if(data){
       var helloCommit = moment(data.trim()).fromNow();
       resolve(helloCommit+" was the last commit"); //return as message for console.
     }
   });
  });
}
//
async function setLocationOfRepo(){
  return new Promise((resolve, reject) => {
    var commandToUse = "git config --get remote.origin.url"
    cmd.get(commandToUse,function(err, data, stderr){
      if(err)reject("Failed to get location branch name.");

      if(data){
        resolve(data.trim());
      }
    });
  });
}

async function updateTheBranch(){
  return new Promise((resolve, reject) => {
    var commandToUse = "git pull "+projectLocation;
    cmd.get(commandToUse,function(err, data, stderr){
      if(err)reject("Failed to update the repo from the remote branch.");
      if(data){
        if(data.trim().indexOf("lready up to date.")!==-1){
          // not a pull .. 
          resolve("Pull Remote ["+pullCount+"] : { " + data.trim() +" }");
        }else{
          // valid pull count it..
          pullCount = pullCount + 1;
          resolve("Pull Remote ["+pullCount+"] : \n\t\t\t{ \n" + data.trim() +"\n }");
        }
      }
    });
  });
}
//
function consoleGUI(msg){
  console.clear();
  if(!projectName || !projectLocation)return;
  var str = "commits";
  if(numOfAutoCommits == 1)str="commit";
  var b = "_"; // used for deco
  for (var i = 0; i < __dirname.length; i++) {
    b +=" _";
    if(b.length > ( __dirname.length + 6))break;
  }
  console.clear();
  console.log("\n\n");
  console.log("\t[ maintain.js ] - [ "+numOfAutoCommits+" auto "+str+" performed ]\n\t  "+b+"\n\t|\n\t|\n\t|\t=> Project Name \n\t|\n\t|\t***** "+projectName+" *****\n\t|\n\t|\t=> Watching Directory \n\t|\n\t|\t"+__dirname+"\n\t|\n\t| "+b);
  console.log("\n\t[ "+msg+" ]");
  console.log("\n\n\n");
}
//
setLocationOfRepo().then((rs)=>{
  projectLocation = rs;
}).catch((e)=>{
    console.clear();
    console.log("critical error...");
  });
//
getNameOfRepo().then( async (response)=>{
  projectName = response.toUpperCase();// set project name
  await getDateOfLastCommit().then((msg)=>{
  console.clear(); 
  consoleGUI(msg); 
  }).catch((e)=>{
    console.clear();
    consoleGUI(e);
  }); 
});
// bring down changes from the branch.
if(projectLocation)updateTheBranch();
// run maintaince on startup
performMaintenceOnProject();
// branch changes are checked every minute..
setInterval(function(){
if(projectLocation){
  updateTheBranch().then((msg)=>{
    console.clear();
    consoleGUI(msg);
  }).catch((e)=>{
    console.clear();
    consoleGUI(e);
  });
}
},(allowedGlobalTime/5));
// exactly every 2 mins the checkup will run.
setInterval(function(){
  performMaintenceOnProject();
},allowedGlobalTime);
// *********** *********** *********** *********** *********** *********** ***********//
