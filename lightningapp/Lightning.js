var geolib = require('geolib');
var request = require('request');
const util = require('util')
//location of lightning data from WWLLN
var url = "https://wwlln.net/new/map/data/current.json";
let log = console.log
var counter = 0
//Timer
var CronJob = require('cron').CronJob;
//Size of station range ring in meters
var RangeRing = 3218700;
var jcounter = 0;
var mcounter = 0;
var keycounter = 0;
var acounter = 0;
var kcounter = 0;
//If shit breaks you might want to look at this package as suspect
// console.log(geolib);

function Lightning(){
  if (jcounter === 1){
    RangeRing = 32187;
    log("new range ring size", RangeRing)
  };
  var singleStrikeEvent
  var jacksonvilleStrikeCount = 0
  var mayportStrikeCount = 0
  var keywestStrikeCount = 0
  var albanyStrikeCount = 0
  var kingsbayStrikeCount = 0
  var allStationStrikeData = []
  var singleStrikeEvent = {};
  var strikeEventObj = {};
  var strikeEventArr = [];
  var err
  var response
  var body
  var resolve
  var reject
  var CronTimer
  var jacksonvilleDistance = 0
  var mayportDistance = 0
  var keywestDistance = 0
  var albanyDistance = 0
  var kingsbayDistance = 0
  var jacksonvilleBearing = 0
  var mayportBearing = 0
  var keywestBearing = 0
  var albanyBearing = 0
  var kingsbayBearing = 0
  var stormCenterjacksonville = 0
  var stormCentermayport = 0
  var stormCenteralbany = 0
  var stormCenterkeywest = 0
  var stormCenterkingsbay = 0
  var stormDirectionjacksonville = 0
  var stormDirectionmayport = 0
  var stormDirectionkeywest = 0
  var stormDirectionalbany = 0
  var stormDirectionkingsbay = 0
//define hospitals

var locations = [
    {
      name: "Jacksonville",
      latitude: 30.216884,
      longitude: -81.691279
    },
    {
      name: "Mayport",
      latitude: 30.353528,
      longitude: -81.424789
    },
    {
      name: "Keywest",
      latitude: 24.579138,
      longitude: -81.690508
    },
    {
      name: "Albany",
      latitude: 31.578461,
      longitude: -84.155884
    },
    {
      name: "Kingsbay",
      latitude: 30.799360,
      longitude: -81.531210
    }
];
var locLength = locations.length;

function populateStrikeEventObj(ld, loc, type, bearing, numOfStrikes, stormCenter){
  return strikeEventObj = {
    "LightningDetected": ld,
    "Location": loc,
    "Type": type,
    "Bearing": bearing,
    "strikesDetected": numOfStrikes,
    "StormCenter": stormCenter
  };
}

//setup promise
function initialize() {
  return new Promise(function(resolve, reject) {

    request({
      url: url,
      method: 'GET',
      json:true,
    }, function (err, response, body) {
      if (err) {
				reject(err);
			} else {
				resolve(body);
			}
	});
});
};
//call promise and wait for response
initialize().then(function(data) {

//  JSON Parser
  var arr = [];
  for (var item in data) {
    arr.push(data[item]);
  }
  util.inspect.defaultOptions.maxArrayLength = null;

  arr.forEach((item) => {
    for (let i=0; i<locLength; i++){

      singleStrikeEvent = geolib.isPointWithinRadius(
          {latitude: item.lat, longitude: item.long},
          {latitude: locations[i].latitude, longitude: locations[i].longitude},
          RangeRing
       )
       if(singleStrikeEvent === true) {
         direction = geolib.getRhumbLineBearing(
           {latitude: item.lat, longitude: item.long},
           {latitude: locations[i].latitude, longitude: locations[i].longitude}
         );
         distance = geolib.getPreciseDistance(
           {latitude: item.lat, longitude: item.long},
           {latitude: locations[i].latitude, longitude: locations[i].longitude}
         );

         switch (locations[i].name) {
           case "Jacksonville":
               jacksonvilleStrikeCount = jacksonvilleStrikeCount + 1;
               var objToPush = {};
               jacksonvilleDistance = jacksonvilleDistance + distance;
               jacksonvilleBearing = jacksonvilleBearing + direction;
               objToPush.location = locations[i].name;
               allStationStrikeData.push(objToPush);
             break;
           case "Mayport":
               mayportStrikeCount = mayportStrikeCount + 1;
               var objToPush = {};
               mayportDistance = mayportDistance + distance;
               mayportBearing = mayportBearing + direction;
               objToPush.location = locations[i].name;
               allStationStrikeData.push(objToPush);
             break;
           case "Keywest":
               keywestStrikeCount = keywestStrikeCount + 1;
               var objToPush = {};
               keywestDistance = keywestDistance + distance;
               keywestBearing = keywestBearing + direction;
               objToPush.location = locations[i].name;
               allStationStrikeData.push(objToPush);
             break;
           case "Albany":
               albanyStrikeCount = albanyStrikeCount + 1;
               var objToPush = {};
               albanyDistance = albanyDistance + distance;
               albanyBearing = albanyBearing + direction;
               objToPush.location = locations[i].name;
               allStationStrikeData.push(objToPush);
             break;
            case "Kingsbay":
                kingsbayStrikeCount = kingsbayStrikeCount + 1;
                var objToPush = {};
                kingsbayDistance = kingsbayDistance + distance;
                kingsbayBearing = kingsbayBearing + direction;
                objToPush.location = locations[i].name;
                allStationStrikeData.push(objToPush);
              break;

           default:
           return;
         }
       }
      }
     });

  sd = jacksonvilleStrikeCount + mayportStrikeCount + keywestStrikeCount + albanyStrikeCount + kingsbayStrikeCount;
  stormCenterjacksonville = Math.trunc(jacksonvilleDistance / jacksonvilleStrikeCount)
  stormCentermayport = Math.trunc(mayportDistance / mayportStrikeCount)
  stormCenterkeywest = Math.trunc(keywestDistance / keywestStrikeCount)
  stormCenteralbany = Math.trunc(albanyDistance / albanyStrikeCount)
  stormCenterkingsbay = Math.trunc(kingsbayDistance / kingsbayStrikeCount)
  stormDirectionjacksonville = Math.trunc(jacksonvilleBearing / jacksonvilleStrikeCount)
  stormDirectionmayport = Math.trunc(mayportBearing / mayportStrikeCount)
  stormDirectionkeywest = Math.trunc(keywestBearing / keywestStrikeCount)
  stormDirectionalbany = Math.trunc(albanyBearing / albanyStrikeCount)
  stormDirectionkingsbay = Math.trunc(kingsbayBearing / kingsbayStrikeCount)

  if(jacksonvilleStrikeCount > 0){
    jcounter = jcounter + 1;
    if(jcounter === 1){
      strikeEventArr.push(populateStrikeEventObj("Yes", "Jax", "Lightning", stormDirectionjacksonville, jacksonvilleStrikeCount, stormCenterjacksonville));
      log("pushed jacksonville");
  }else if(jcounter > 1){
    log("jacksonville lightning already reported");
  }
}
  if(mayportStrikeCount > 0){
    mcounter = mcounter + 1;
    if(mcounter === 1){
      strikeEventArr.push(populateStrikeEventObj("Yes", "Mayport", "Lightning", stormDirectionmayport, mayportStrikeCount, stormCentermayport));
      log("pushed mayport");
  }else if(mcounter > 1){
    log("mayport lightning already reported");
  }
}
  if(keywestStrikeCount > 0){
    keycounter = keycounter + 1;
    if(keycounter === 1){
    strikeEventArr.push(populateStrikeEventObj("Yes", "Keywest", "Lightning", stormDirectionkeywest, keywestStrikeCount, stormCenterkeywest));
    log("pushed keywest")
  }else if(keycounter > 1){
    log("keywest lightning already reported");
  }
}
  if(albanyStrikeCount > 0){
    acounter = acounter + 1;
    if(acounter === 1){
    strikeEventArr.push(populateStrikeEventObj("Yes", "Albany", "Lightning", stormDirectionalbany, albanyStrikeCount, stormCenteralbany));
    log("pushed albany")
  }else if(acounter > 1){
    log("albany lightning already reported");
  }
}
  if(kingsbayStrikeCount > 0){
    kcounter = kcounter + 1;
    if(kcounter === 1){
    strikeEventArr.push(populateStrikeEventObj("Yes", "Kingsbay", "Lightning", stormDirectionkingsbay, kingsbayStrikeCount, stormCenterkingsbay));
    log("pushed kingsbay");
  }else if(kcounter > 1){
    log("keywest lightning already reported");
  }
}
  if(sd === 0) {
    log("aint no lightning here bro")
    strikeEventArr.push(populateStrikeEventObj("No", "None", "Lightning", "0", "0", "0"));
    jcounter = 0;
    mcounter = 0;
    keycoutner = 0;
    acounter = 0;
    kcounter = 0;
    log("all counters zeroized")
}
log('strikeEventArr',strikeEventArr);
log("range ring size", RangeRing);

//     log(sd, "strikes detected");
//     log(jacksonvilleStrikeCount, "strikes detected near Jacksonville");
//     log(mayportStrikeCount, "strikes detected near Mayport");
//     log(keywestStrikeCount, "strikes detected near Keywest");
//     log(albanyStrikeCount, "strikes detected near Albany");
//     log(kingsbayStrikeCount, "strikes detected near Kingsbay");
});
// cT = '* 1 * * * *';
// log(cT)
};

new CronJob('*/1 * * * * ', Lightning, null, true,'America/New_York');
// Lightning()
