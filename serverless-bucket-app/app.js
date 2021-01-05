// app.js

const express = require('express')
const sls = require('serverless-http')
const app = express()
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({
  extended: true
}));

// config for AWS + s3
var AWS = require('aws-sdk')
AWS.config.update({ region: 'eu-central-1' })

const ID = 'AKIAQFMFCWDX6NAD7VNG';
const SECRET = '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';
const BUCKET_NAME = 'my.pretty.random.bucket';

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});

/* express server */
app.get('/', async (req, res, next) => {
  getListOfObjects().then((result) => {
    res.status(200).send(
      wrapInHtml(`
        <h1>Files in ${BUCKET_NAME}:</h1>
        ${getForm()}
        ${result}
      `)
    )
  }).catch(err => {
    res.status(200).send(err)
  })
});

app.post('/upload', async (req, res, next) => {
  // const response = JSON.stringify(req.body);
  // res.status(200).send(response)
  // res.status(200).send({ content: req.body.content, fileName: req.body.fileName })
  res.status(200).send(
    wrapInHtml(`
      <h1>Success!</h1>
      <p>${uploadTextFile(req.body.content, req.body.fileName)}</p>
      <a href="/">→ show files</a>
    `)
  )
})

/* functions */

const uploadTextFile = (content, fileName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName + '.txt',
    Body: content
  };

  s3.upload(params, function (err, data) {
    if (err) {
      return err;
    }
    return `File uploaded successfully. ${data.Location}`;
  });
}

const getListOfObjects = () => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: BUCKET_NAME
    };

    s3.listObjects(params, function (err, data) {
      if (err) reject(err)
      var list = `<ol>`
      const expire = 180
      data.Contents.forEach(function (object) {
        const objUrl = s3.getSignedUrl('getObject', {
          Bucket: BUCKET_NAME,
          Key: object.Key,
          Expires: expire
        })
        list += `<li><a href="${objUrl}">${object.Key}</a></li>`
      })
      list += `</ol>`
      resolve(list)
    })
  })
}

const getForm = () => {
  return `
    <form action="/upload" method="post">
      <label for="fileName">File Name:</label><br>
      <input type="text" id="fileName" name="fileName"><br>
      <label for="content">Content:</label><br>
      <input type="text" id="content" name="content">
      <input type="submit" value="Save to s3">
    </form>
  `
}

const wrapInHtml = (content) => {
  return `
    <html>
      <head>
        <title>Sample Lambda Microservice</title>
        <author>J. Kamphausen</author>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `
}

module.exports.server = sls(app)

