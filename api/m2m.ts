// Serving requests to the site (SPA)
import { NowRequest, NowResponse } from '@vercel/node'
import request from 'request';
const logger = require('./logger');
import jwt from 'jsonwebtoken';
var jwksClient = require('jwks-rsa');

var client = jwksClient({
  jwksUri: 'https://sample-apps.auth0.com/.well-known/jwks.json'
});

async function pushData(data) {
    const res = await request.post('http://localhost:3000/api/channels-event', {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      console.error(res.body, 'failed to push data')
    }
  }

export default async (req: NowRequest, res: NowResponse) => {
  const accessToken = req.headers['authorization'].split(' ')[1]
  pushData({"M2M API": req.headers['authorization'].split(' ')[1]})
  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, function(err, key) {
      var signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  jwt.verify(accessToken, getKey, function(err, decoded) {
  pushData({"M2M API": `Checking SPA accessToken...`})
  if(err) {res.status(401).send(err)}
  pushData({"M2M API": `Well, SPA accessToken checked out`})
  pushData({"M2M API": `Now calling Tasks API from M2M API...`})
  const getAccessToken = (callback) => {
    pushData({"M2M API": `We now have M2M accessToken: ${accessToken}`})
    const options = {
      method: 'POST',
      url: 'https://' + "sample-apps.auth0.com" + '/oauth/token',
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      },
      body: {
        audience: 'https://m2m.lab',
        grant_type: 'client_credentials',
        client_id: '6N0TB6jFGUKfR1t5SfRw7Nn9IkldgO9f',
        client_secret: 'LXsvFxcejR0sIPUDc9NFEEFD6XGfZ-MC_5b8w7aVZ92Zp2ZROJuOHQUrhaV6-M6u'
      },
      json: true
    };
  
    request(options, function(err, res, body) {
      if (err || res.statusCode < 200 || res.statusCode >= 300) {
        return callback(res && res.body || err);
      }
  
      callback(null, body.access_token);
    });
  }

  
  // Get the access token.
  getAccessToken(function(err, accessToken) {
    const options = {
      url: 'http://localhost:3000/api/tasks',
      headers: {
        authorization: 'Bearer ' + accessToken
      }
    }

    pushData({"M2M API": `Ok, now let's actually reach out to Tasks API with our M2M token...`})

    request.get(options, (err, response, body) => {
      if (err || response.statusCode !== 200) {
        res.status(response.statusCode).send({"status": response.statusCode, "error": JSON.parse(response.body).secretResult.name, "message": JSON.parse(response.body).secretResult.message})
      } else {
        res.status(response.statusCode).send({"result": JSON.parse(body).secretResult})
      }
    });
    
  })
});
}
