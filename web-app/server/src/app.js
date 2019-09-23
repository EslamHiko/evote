'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const bcrypt = require('bcrypt')
let network = require('./fabric/network.js');
const jwt = require('jsonwebtoken');
const auth = require('./auth/auth')
const app = express();
app.use(morgan('combined'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

//get all assets in world state
app.get('/queryAll', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryAll', '');
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);

});

app.get('/getCurrentStanding', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryByObjectType', 'votableItem');
  let parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

});

//vote for some candidates. This will increase the vote count for the votable objects
app.post('/castBallot', async (req, res) => {
  let networkObj = await network.connectToNetwork(req.body.voterId);
  console.log('util inspecting');
  console.log(util.inspect(networkObj));
  req.body = JSON.stringify(req.body);
  console.log('req.body');
  console.log(req.body);
  let args = [req.body];

  let response = await network.invoke(networkObj, false, 'castVote', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // let parsedResponse = await JSON.parse(response);
    res.send(response);
  }
});
app.get('/user',auth,async (req,res)=>{
  res.send(req.user)
})
//query for certain objects within the world state
app.post('/queryWithQueryString', async (req, res) => {

  let networkObj = await network.connectToNetwork(appAdmin);
  let response = await network.invoke(networkObj, true, 'queryByObjectType', req.body.selected);
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);

});

//get voter info, create voter object, and update state with their voterId
app.post('/register', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);
  // let voterId = req.body.voterId;
  req.body.password = await bcrypt.hash(req.body.password, 10);
  const hash = req.body.password;
  var newUser = new User({
      name:req.body.name,
      email:req.body.email,
      password:hash
    });

  req.body.id = newUser.id;
  req.body.date = newUser.date;
  console.log(req.body)
  //first create the identity for the voter and add to wallet
  let response = await network.registerVoter(newUser.id, newUser.name, newUser.email, newUser.password,newUser.date);
  console.log('response from registerVoter: ');
  console.log(response);
  if (response.error) {
    res.send(response.error);
  } else {
    let networkObj = await network.connectToNetwork(newUser.id);
    console.log('networkobj: ');
    console.log(networkObj);

    if (networkObj.error) {
      res.send(networkObj.error);
    }
    console.log('network obj');
    console.log(util.inspect(networkObj));


    req.body = JSON.stringify(req.body);
    let args = [req.body];
    //connect to network and update the state with voterId
    console.log('beffore ')
    console.log(args)
    let invokeResponse = await network.invoke(networkObj, false, 'createVoter', args);

    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {

      console.log('after network.invoke ');
      let parsedResponse = JSON.parse(invokeResponse);
      parsedResponse += '. Use voterId to login above.';
      res.send({success:true,user:newUser});

    }

  }


});

//used as a way to login the voter to the app and make sure they haven't voted before
app.post('/login', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body)
  let networkObj = await network.connectToNetwork('admin');
  console.log('networkobj: ');
  console.log(util.inspect(networkObj));

  if (networkObj.error) {
    res.send(networkObj);
  }

  let invokeResponse = await network.invoke(networkObj, true, 'queryByData', JSON.stringify({email:req.body.email,type:'user'}
));
  if (invokeResponse.error) {
    res.send(invokeResponse);
  } else {
    console.log('after network.invoke ');
    console.log(invokeResponse)
    let parsedResponse = await JSON.parse(JSON.parse(invokeResponse));
    console.log(parsedResponse[0])
    console.log(parsedResponse[0]["Record"])
    let user = parsedResponse[0].Record;
    console.log(user.password)
    console.log(req.body.password)
    await bcrypt.compare(req.body.password,user.password)
        .then(isMatch => {
          if(!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

           jwt.sign(
            { id: user.id,email:user.email,name:user.name },
            "top_secret",
            { expiresIn: 3600 },
            (err, token) => {
              if(err) throw err;
              res.json({
                token,
                user
              });
            }
          )
        });
    // if (parsedResponse.ballotCast) {
    //
    //   res.send(response);
    // }
    // let response = `Voter with voterId ${parsedResponse.voterId} is ready to cast a ballot.`
    // res.send(parsedResponse);
  }

});

app.post('/queryByKey', async (req, res) => {
  console.log('req.body: ');
  console.log(req.body);

  let networkObj = await network.connectToNetwork(appAdmin);
  console.log('after network OBj');
  let response = await network.invoke(networkObj, true, 'readMyAsset', req.body.key);
  response = JSON.parse(response);
  if (response.error) {
    console.log('inside eRRRRR');
    res.send(response.error);
  } else {
    console.log('inside ELSE');
    res.send(response);
  }
});


app.listen(process.env.PORT || 8081);
