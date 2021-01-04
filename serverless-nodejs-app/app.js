// app.js

const fetch = require('node-fetch');

const endpoint = 'https://swapi.dev/api'
const test = endpoint + '/people/21/';

const express = require('express')
const sls = require('serverless-http')
const app = express()
app.get('/', async (req, res, next) => {

  const options = {
    method: 'GET'
  }

  await fetch(test, options)
    .then(res => res.json())
    .then(json => res.status(200).send(json));



  // res.status(200).send('Hello World!')
})
module.exports.server = sls(app)