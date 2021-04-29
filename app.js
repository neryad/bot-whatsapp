const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
//const client = new Client();
// const axios = require('axios').default;
// const loadJsonFile = require('load-json-file');
const app = express();
const fs = require('fs');
//const puppeteer = require('puppeteer');
const myQuestions = [
  {
    question: 'Links manchester united',
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

function filterItems(query) {
  return myQuestions
    .filter(function (el) {
      return el.question == query;
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

const withSession = () => {
  console.log('Validando con whatsapp......');
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
  console.log('No tenemos session guardada');
  client = new Client();
  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
  });

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

const sendMessage = (to, message) => {
  client.sendMessage(to, message);
};

fs.existsSync(SESSION_FILE) ? withSession() : withOutSession();
