var express = require('express');
var router = express.Router();

var PNF = require('google-libphonenumber').PhoneNumberFormat;
var request = require('request');
var http = require('http');


/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log(req.query.msg);
  res.render('index');
});

router.post('/getSend', (req,res) => {  // Get an instance of `PhoneNumberUtil`.
  var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

  var url ='https://randomuser.me/api/?results=5'
  request(url, function (error, response, usersStr) {
    if (error) console.log(error); // Show more prominently
    else {
      console.log('Received user data from randomuser.me. Processing...');
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
      console.log('Processed. Sending processed user data...');
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
      url: "https://requestb.in/1fkwxhq1",
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: {user: usr, index: ind}
    }, function (error, result, body) {
      if (error) return console.log(error); // Display with error page?
      else {
        console.log('Sent successfully: User '+ind+'. Message: '+body);
      }
    });

/*    
    res.redirect('/pizzaVote')
 */

  }


});

module.exports = router;
