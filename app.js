const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qr = require('qr-image');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');

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

let newQuestions = [
  {
    question: 'links roma',
    title: 'Manchester United 🆚 AS ROMA',
    time: '3:00 PM',
    place: 'Old Trafford',
    referi: 'Carlos del Cerro',
    links: [
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
    ],
  },
  {
    question: 'links roma2',
    title: 'Manchester United 🆚 AS ROMA',
    time: '3:10 PM',
    place: 'Old Trafford2',
    referi: 'Carlos del Cerro2',
    links: [
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
    ],
  },
  {
    question: 'links roma3',
    title: 'Manchester United 🆚 AS ROMA',
    time: '3:20 PM',
    place: 'Old Trafford3',
    referi: 'Carlos del Cerro3',
    links: [
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
      'http://www.ovostreams.com/manchester-utd-vs-roma.php',
    ],
  },
];
const SESSION_FILE = './session.json';
let client;
let sessionData;

function filterItems(query) {
  console.log(query);

  return newQuestions
    .filter(function (el) {
      return el.question.toLowerCase() == query.toLowerCase();
    })
    .map(function (el) {
      console.log(el, 'valido');
      return el;
    });
}

function getAnswer(ask) {
  try {
    const answers = filterItems(ask);
    var response = answers.map(function (x, i) {
      console.log(x.links[links.length], 'i');
      return `${x.title}

      ⏰ ${x.time}

      🏟 ${x.place}

      👮🏻 ${x.referi}

  Links Disponibles :

      ⮕ ${x.links} 📲 💻

  VAMOS!`;
    });

    console.log(response, 'response');

    return response;
  } catch (error) {
    client.initialize();
  }
}

const clearNumber = (number) => {
  number = number.replace('@c.us', '');
  number = `${number}`;
  return number;
};

const sendMessage = (number, text) =>
  new Promise((resolve, reject) => {
    number = number.replace('@c.us', '');
    console.log(number, 'number1');
    number = `${number}@c.us`;
    console.log(number, 'number2');
    const message = text;
    // const msg = client.sendMessage(number, message);
    //const msg = client.sendMessage(number, message);
    client.on('message', (msg) => {
      msg.reply(message);
      resolve(msg);
    });
    // resolve(msg);
    //clearNumber(number);
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
    console.log('cliente is ready');
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
    try {
      const { from, to, body } = msg;
      let resp = getAnswer(body);

      let cha = from.indexOf('-');
      console.log(cha);
      let preNum = from.slice(0, cha);
      console.log(preNum, 'preNum');

      let number = preNum.replace('@c.us', '');
      number = `${number}@c.us`;
      console.log(number, 'number');
      if (!resp || resp.length === 0) {
        return;
      }
      msg.reply(resp.toString());
      //sendMessage(number, resp.toString());
    } catch (error) {
      console.log('Error ===> : ', error);
    }
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

app.get('/', (req, res, next) => {
  res.status(200).json({
    ok: true,
    menssage: 'Get Root Request successful',
  });
});

app.listen(app.get('port'), () => {
  console.log(`Server ready on port : ${app.get('port')}`);
});
