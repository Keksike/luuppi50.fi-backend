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

function generateEmailParams(body) {
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
cocktail: ${content.cocktail}
greeting: ${content.greeting}
drink: ${content.drink}
food: ${content.food}
specialDiet: ${content.specialDiet}
sillis: ${content.sillis}
avec: ${content.avec}
isAvecOfInvitee: ${content.isAvecOfInvitee}
other: ${content.other}
`;

  console.log('sending email:' + emailContent);

  return {
    Source: myEmail,
    Destination: { ToAddresses: [myEmail] },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: emailContent,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `LUUPPI50: Ilmoittautuminen henkilöltä: ${content.name}`,
      },
    },
  };
}

module.exports.send = async event => {
  try {
    const emailParams = generateEmailParams(event.body);
    const data = await ses.sendEmail(emailParams).promise();
    return generateResponse(200, data);
  } catch (err) {
    return generateError(500, err);
  }
};
