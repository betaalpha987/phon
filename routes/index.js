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

  var url ='https://randomuser.me/api/?results=5'
  request(url, function (error, response, usersStr) {
    if (error) console.log(error); // Show more prominently
    else {
      res.io.emit('socketToMe','Received user data from randomuser.me. Processing...');
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
      res.io.emit("socketToMe", "User data processed. Sending...");

      // Send each user seperately. Can I check all posts got sent with a tally?
      let i = 0;
      let interv = setInterval(()=>{ // Slight delay added as otherwise requestbin seems to lose posts
        sendUser(ourUserL[i],i);
        i+=1;
        if (i >=5) clearInterval(interv);
      },1000);
    }
  });

  function sendUser(usr,ind) {
    request({
      url: "http://requestb.in/10gc05d1", // The old requestbin timed out. Here's a new one.
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: {user: usr, index: ind} // Includes user number sent
    }, function (error, result, body) {
      if (error) return console.log(error); // Display with error page?
      else {
        res.io.emit('socketToMe', 'Sent successfully: User '+ind+'. Message: '+body);
      }
    });

  }


});

module.exports = router;
