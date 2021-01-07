// Fetching tasks from Todoist

import { NowRequest, NowResponse } from '@vercel/node'
import jwt from 'jsonwebtoken';
var jwksClient = require('jwks-rsa');
const requireScope = require('./requireScope');
const logger = require('./logger')

var client = jwksClient({
  jwksUri: 'https://sample-apps.auth0.com/.well-known/jwks.json'
});

export default async (request: NowRequest, response: NowResponse) => {
  const authorizationHeader = request.headers['authorization']
  console.log("Got this from M2M API", authorizationHeader.split(' ')[1] )

  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, function(err, key) {
      var signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

jwt.verify(authorizationHeader.split(' ')[1], getKey, function(err, decoded) {
  console.log("Verifying the token we got from M2M API...")
  if (err) { response.status(401).send({"secretResult": {"name": "Unauthorized", "message": `Token cannot be verified (${err})`}}); return }
  if (decoded.scope !== "read:tasks") { response.status(403).send({ "secretResult": {"name": "Unauthorized", "message": "Insufficient Scope."}}); return }
  console.log("M2M API token checked out. All is good, returning super secret results!")
response.status(200).send({"secretResult": decoded})
  return decoded
});
}
