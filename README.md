![alt text](imgs/small.png "Behaviors")


[![Build Status](https://travis-ci.com/kod3000/behaviors.svg?branch=main)](https://travis-ci.com/kod3000/behaviors)
## Description

Made to control system based events in a timely manner. 

The idea here is to have a schedule of timed commands that can be executed without the need of supervision. So mundane tasks like 'updating a file in a shared library' or 'running a script at certain hour but randomize it so that its not too botty'. 

In a way its kind of like an alarm clock for your system based tasks. When the time hits the command executes via command line. Built in a way that you can be very specific on how you want it to behave. Using a simple json file for now all you have to do is edit the file once its created and you're set to go. Set your behavior to repeat everyday or just have it run once, best thing is that you dont have to wait for the events to happen just set the date and let it run. ^_^


# Sample

    [
      {
        "runTime": "07-20-21 01:09:54",
        "cmd": "pwd",
        "nextRun": {
          "days": 1, // after scheduled run, do it again in 1 day from now
          "mins": "r", // randomly choose the minutes/secs ie( 2:15:32am || 2:41:02am || 2:01:44am )
          "sec": "r" 
        }
      },
      {
        "runTime": "01-01-22 00:00:01", // not specifing 'nextRun' means this will only run once on the scheduled time
        "cmd": "echo 'hello stars, the earth says happy new year!!!'" 
      }
    ]


# Donate

![btc](https://github.com/kod3000/EventsManager/blob/d54efb0e1301a6cc1d508b8a9c571f3bb8da04b8/public/img/bitcoin.png) Bitcoin: `34zin8qyLHUcaN1E9veNoorPujaRVnr6ZZ`
