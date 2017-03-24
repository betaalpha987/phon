var express = require('express');
var router = express.Router();

var PNF = require('google-libphonenumber').PhoneNumberFormat;
var request = require('request');
var http = require('http');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/getSend', (req,res) => {  // Get an instance of `PhoneNumberUtil`.
  var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

  var url ='https://randomuser.me/api/?results=5'
  request(url, function (error, response, usersStr) {
    if (!error) { // What happens if error?
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
      sendUsers(ourUserL);
    }
  });

  function sendUsers(ourUserL) {
    app.post("")
/*    url:'https://requestb.in/1fkwxhq1',
    type: "GET",
    dataType: 'jsonp',
    data: ourU,
    success: function(result) {
      console.log('===Successfully posted.', result);
    },
*/ 
    res.render('getsend', { title: 'Testing' });


  }


});

module.exports = router;
