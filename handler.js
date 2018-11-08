const aws = require('aws-sdk');
const ses = new aws.SES();
const myEmail = process.env.EMAIL;
const myDomain = process.env.DOMAIN;

function generateResponse(code, payload) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(payload),
  };
}

function generateError(code, err) {
  console.log(err);
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(err.message),
  };
}

function generateReportEmailParams(body) {
  const { content } = JSON.parse(body);

  if (!content) {
    throw new Error(
      "Missing parameters! Make sure to add parameters 'content'.",
    );
  }

  const emailContent = `
name: ${content.name}
email: ${content.email}
phone: ${content.phone}
organization: ${content.organization}
startingYear: ${content.startingYear}
cocktail: ${content.cocktail}
greeting: ${content.greeting}
drink: ${content.drink}
coffeeAvec: ${content.coffeeAvec}
food: ${content.food}
specialDiet: ${content.specialDiet}
sillis: ${content.sillis}
avec: ${content.avec}
isAvecOfInvitee: ${content.isAvecOfInvitee}
other: ${content.other}
`;

  return {
    Source: myEmail,
    Destination: { ToAddresses: [myEmail] },
    Message: {
      Body: { Text: { Charset: 'UTF-8', Data: emailContent } },
      Subject: {
        Charset: 'UTF-8',
        Data: `LUUPPI50: Ilmoittautuminen henkilöltä: ${content.name}`,
      },
    },
  };
}

function generateUserEmailParams(body) {
  const { content } = JSON.parse(body);

  if (!content) {
    throw new Error(
      "Missing parameters! Make sure to add parameters 'content'.",
    );
  }

  const emailContent = `
Hei!

Kiitos ilmoittautumisestasi Luuppi ry:n vuosijuhliin. Vuosijuhlat voit maksaa Luuppi ry:n tilille FI68 8216 9710 0006 17 ja laittamalla kommenttikenttään viestin muotoa ”oma nimi/Luuppi50”. Mikäli maksat myös avecin samalla maksulla, ilmoitathan myös tästä kommenttikentässä. Maksu tulee suorittaa ilmoittautumisen jälkeen, viimeistään kuitenkin 25.11.

Lisätietoa vuosijuhlista saat lähempänä itse juhlia sekä tietenkin vuosijuhlien verkkosivuilta https://luuppi50.fi. Juhlissa nähdään!

Juhlavin terveisin,
Vuosijuhlatiimi
vuosijuhlat@luuppi.fi
`;

  console.log('sending email to user:' + emailContent);

  return {
    Source: myEmail,
    Destination: { ToAddresses: [content.email] },
    Message: {
      Body: { Text: { Charset: 'UTF-8', Data: emailContent } },
      Subject: {
        Charset: 'UTF-8',
        Data: `Luupin 50-vuotisjuhlien ilmoittautumisen vahvistus`,
      },
    },
  };
}

module.exports.send = async event => {
  try {
    const reportEmailParams = generateReportEmailParams(event.body);
    console.log(
      'sending email to reporting:' + JSON.stringify(reportEmailParams),
    );
    const data = await ses.sendEmail(reportEmailParams).promise();

    const userEmailParams = generateUserEmailParams(event.body);
    console.log(
      'sending email to reporting:' + JSON.stringify(userEmailParams),
    );
    const emailMailData = await ses.sendEmail(userEmailParams).promise();

    return generateResponse(200, data);
  } catch (err) {
    return generateError(500, err);
  }
};
