const express = require('express');
const app = express();
const validator = require('is-my-json-valid');
const nodemailer = require("nodemailer");
const dotenv = require('dotenv').config()
var cors = require('cors')
var corsOptions = {
  origin: process.env.DOMAIN_ORIGIN,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });


var validate = validator({
    required: true,
    type: 'object',
    properties: {
      title: {
        required: true,
        type: 'string'
      },
      name: {
        required: true,
        type: 'string'
      },
      email: {
        required: true,
        type: 'string'
      },
      message: {
        required: true,
        type: 'string'
      }
    }
  })

app.use(express.json());

app.post('/sendmail', cors(corsOptions), async function (req, res) {
    var correctjson = validate(req.body);
    if(correctjson)
    {
        try
        {
            var object = req.body;

            let info = await transporter.sendMail({
                to: process.env.TO_ADDRESS, // list of receivers
                subject: "Wiadomość od " + object.name + " <" + object.email + ">",
                text: "Temat: " + object.title + "\nWiadomość: " + object.message
              })
            
            console.log("Done");
            res.send("OK");
        }
        catch(error)
        {
            res.send("Server error");
            console.log("Error: %s", error);
        }
    }
    else
    {
        res.send("Invalid json format");
    }
    console.log(req.body);
})

app.listen(process.env.LISTEN_PORT);