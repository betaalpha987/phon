var express = require('express');
var router = express.Router();

var PNF = require('google-libphonenumber').PhoneNumberFormat;
var request = require('request');
var http = require('http').Server(router);
var io = require('socket.io')(http);



router.get('/', function(req, res, next) {
  res.render('index');
});

io.on('connection', function(socket){
  console.log('A user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

router.post('/getSend', (req,res) => {  // Get an instance of `PhoneNumberUtil`.
  var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

  rUserURL ='https://randomuser.me/api/?results=5';
  rBinURL = "http://requestb.in/1341zoa1"; // The old requestbin timed out. Here's a new one.

  res.io.emit('messages','Requesting data from ' + rUserURL);

  request(rUserURL, function (error, response, usersStr) {
    if (error) res.io.emit('messages', error.name + ': ' + error.message);
    else {
      res.io.emit('messages','Received user data. Processing...');
      let ourUserL = [];
      let userList = JSON.parse(usersStr);
      
      userList.results.forEach((user,i)=> {
        let ourU = {};      
        ourU.firstname = user.name.first;
        ourU.surname = user.name.last;
        ourU.emailDomain = user.email.slice(user.email.indexOf('@')+1)
        let x = new Date(Date.parse(user.registered));
        let y = new Date(Date.parse(user.dob));
        ourU.ageWhenRegistered = x.getFullYear()-y.getFullYear();
        let m = phoneUtil.parse(user.cell,user.nat);
        let p = phoneUtil.parse(user.phone,user.nat);
        ourU.mobileNumber = phoneUtil.format(m,PNF.E164).slice(1);
        ourU.phoneNumber = phoneUtil.format(p,PNF.E164).slice(1);
        ourU.phoneNumberCountryCode = user.nat;
        ourUserL.push(ourU);
      });
      res.io.emit("messages", "User data processed. Sending to " + rBinURL);

      // Send each user seperately.
      // Slight delay between posts as otherwise requestbin sometimes loses them
      let i = 0;
      let interv = setInterval(()=>{
        if (i <5) {
          sendUser(ourUserL[i],i);
          i+=1;
        } else {
          res.io.emit('messages', 'Go <a href="'+rBinURL+'?inspect">here</a> to view users in destination API');
          clearInterval(interv);
        }
      },1000);
    }
  });

  function sendUser(usr,ind) {
    request({
      url: rBinURL, 
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: usr
    }, function (error, result, body) {
      if (error) res.io.emit('messages', error.name + ': ' + error.message);
      else {
        res.io.emit('messages', 'Sent successfully: User '+ind+'. Message: '+body);
      }
    });
  }
});

module.exports = router;
