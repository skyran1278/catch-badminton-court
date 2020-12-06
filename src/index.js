const { CronJob } = require('cron');
const fetch = require('node-fetch');
const FormData = require('form-data');

const courts = {
  A: 83,
  B: 84,
  C: 1074,
  D: 1075,
  E: 87,
  F: 2225,
};

const people = {
  paul: {
    session: process.env.PAUL_SESSION,
    account: process.env.PAUL_ACCOUNT,
    password: process.env.PAUL_PASSWORD,
  },
  ariel: {
    session: process.env.ARIEL_SESSION,
    account: process.env.ARIEL_ACCOUNT,
    password: process.env.ARIEL_PASSWORD,
  },
};

// 欺騙伺服器用
const userAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

// 每次需要修改的地方
const date = '2020-12-13';
const catchCourts = [
  { person: people.paul, court: courts.A, time: 19 },
  { person: people.paul, court: courts.A, time: 20 },
  { person: people.ariel, court: courts.B, time: 19 },
  { person: people.ariel, court: courts.B, time: 20 },
];

const loginJob = new CronJob('50 59 23 * * *', () => {
  Object.entries(people).forEach(([name, person]) => {
    const formData = new FormData();
    formData.append('account', person.account);
    formData.append('pass', person.password);
    formData.append('AccountCheck', 'true');
    formData.append('isRemember', 'false');

    fetch(`http://nd01.allec.com.tw/MobileLogin/MobileLogin?tFlag=1`, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': userAgent,
        Cookie: `ASP.NET_SessionId=${person.session}`,
      },
    })
      .then((res) => res.text())
      .then((body) => {
        const data = body.split(',');
        console.log(data[0] === '0' ? `${name} 登入成功` : `${name} 登入失敗`);
      });
  });
});

const catchBadmintonCourtJob = new CronJob('00 00 00 * * *', () => {
  catchCourts.forEach(({ court, time, person }) => {
    fetch(
      `http://nd01.allec.com.tw/MobilePlace/MobilePlace?tFlag=3&PlaceType=1&BookingPlaceID=${court}&BookingDate=${date}&BookingTime=${time}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          Cookie: `ASP.NET_SessionId=${person.session}`,
        },
      }
    )
      .then((res) => res.text())
      .then((body) =>
        console.log(
          /預約成功/.test(body)
            ? `${court} ${time} 預約成功`
            : `${court} ${time} 預約失敗`
        )
      );
  });
});

catchBadmintonCourtJob.start();
loginJob.start();
