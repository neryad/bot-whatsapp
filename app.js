const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qr = require('qr-image');
const express = require('express');
//const client = new Client();
// const axios = require('axios').default;
// const loadJsonFile = require('load-json-file');
const app = express();
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');
//const puppeteer = require('puppeteer');
const myQuestions = [
  {
    question: 'links manchester united',
    answers: `Manchester United  🆚 AS ROMA
    ⏰ 3:00 PM
    🏟 Old Trafford
    👮🏻 Arbrito: Carlos del Cerro

    Links Disponibles :
    ⮕ http://www.ovostreams.com/manchester-utd-vs-roma.php  📲 💻
    ⮕ http://www.ovostreams.com/manchester-utd-vs-roma.php 📲 💻
    ⮕ http://www.ovostreams.com/manchester-utd-vs-roma.php  📲 💻

    VAMOS!`,
  },
  {
    question: 'links Roma',
    answers: `Manchester United  🆚 AS ROMA
    ⏰ 3:00 PM
    🏟 Old Trafford
    👮🏻 Arbrito: Carlos del Cerro

    Links Disponibles :
    ⮕ http://www.ovostreams.com/manchester-utd-vs-roma.php  📲 💻
    ⮕ http://www.ovostreams.com/manchester-utd-vs-roma.php 📲 💻
    ⮕ http://www.ovostreams.com/manchester-utd-vs-roma.php  📲 💻

    VAMOS!`,
  },
];

const SESSION_FILE = './session.json';
let client;
let sessionData;

function filterItems(query = 'asd') {
  let test;
  // fetch('./wawa.json')
  // .then(function (res) {
  //   return res.json();
  // })
  // .then(function (data) {
  //   console.log(data);
  // });
  return myQuestions
    .filter(function (el) {
      return el.question.toLowerCase() == query.toLowerCase();
    })
    .map(function (el) {
      console.log('valido');
      return el.answers;
    });
}

function getAnswer(ask) {
  try {
    let answers = filterItems(ask);
    return answers;
  } catch (error) {
    console.log(error);
  }
}

const sendMessage = (number, text) =>
  new Promise((resolve, reject) => {
    number = number.replace('@c.us', '');
    number = `${number}@c.us`;
    const message = text;
    const msg = client.sendMessage(number, message);
    resolve(msg);
  });

const withSession = () => {
  console.log('Validando con WhatsApp......');
  sessionData = require(SESSION_FILE);
  console.log('Espere por favor...');

  client = new Client({
    session: sessionData,
    puppeteer: {
      args: ['--no-sandbox'],
    },
  });

  client.on('ready', () => {
    console.log('cliente is ready');
    listenMessage();
  });

  client.on('auth_failure', () => {
    console.log('Error de auth vuelve a generar el QRCode(Borrar vinculo del equipo)');
  });
  client.initialize();
};

const withOutSession = () => {
  // var myJSON = JSON.stringify(myQuestions);
  // console.log(myJSON);
  // fetch('./wawa.json')
  //   .then(function (res) {
  //     return res.json();
  //   })
  //   .then(function (data) {
  //     console.log(data);
  //   });
  console.log('No tenemos session guardada');
  client = new Client({
    puppeteer: {
      args: ['--no-sandbox'],
    },
  });
  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    generateImage(qr);
  });

  client.on('ready', () => {
    listenMessage();
  });
  //withSession();
  client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE, JSON.stringify(session), (err) => {
      if (err) {
        console.log(err, 'Error en el guardado de la session');
      }
    });
  });

  client.initialize();
};

const listenMessage = () => {
  client.on('message', (msg) => {
    const { from, to, body } = msg;
    let resp = getAnswer(body);
    if (!resp || resp.length === 0) {
      return;
    }
    sendMessage(from, resp.toString());
  });
};

const generateImage = (base64) => {
  let qr_svg = qr.image(base64, { type: 'svg', margin: 4 });
  qr_svg.pipe(require('fs').createWriteStream('qr-code.svg'));
  console.log(`'http:localhost:${app.get('port')}/qr`);
};

fs.existsSync(SESSION_FILE) ? withSession() : withOutSession();
app.set('port', process.env.PORT || 3000);
app.get('/qr', (req, res) => {
  res.writeHead(200, { 'content-type': 'image/svg+xml' });
  fs.createReadStream('./qr-code.svg').pipe(res);
});

app.listen(app.get('port'), () => {
  console.log(`Server ready on port : ${app.get('port')}`);
});
