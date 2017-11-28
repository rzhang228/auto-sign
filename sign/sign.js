const http = require('http');
const querystring = require('querystring');
const hex_md5 = require('./md5');

let userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36 FH/1.0.0.0 (C650C8A73DEADC49;7F31BE8791C7A7AB,9F5314A3D5B3319D,B685F2656A61623C)';
let headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Host': 'oa.njsecnet.com:8080',
  'Origin': 'http://oa.njsecnet.com:8080',
  'User-Agent': userAgent,
  'X-Requested-With': 'XMLHttpRequest'
};
let cookieList;

function checkAccount(userData) {
  let data = querystring.stringify({
    authUserName: userData.username,
    authPassword: userData.password,
    authPoliceNo: '',
    authLoginType: 1,
    authLoginIP: '',
    authLoginMAC: '',
    authRememberMe: 1
  })

  return new Promise((resolve, reject) => {
    let req = http.request({
      method: 'post',
      host: 'oa.njsecnet.com',
      port: '8080',
      path: '/weboa/auth/login!login.action',
      headers: Object.assign({}, {
        'Content-Length': Buffer.byteLength(data),
        'Referer': 'http://oa.njsecnet.com:8080/weboa/auth/login!toLoginPage.action'
      }, headers)
    }, (res) => {
      let body = '';
      res.on('data', function (chunk) {
        body += chunk;
      })
      res.on('end', function () {
        if (body.indexOf('success') > -1) {
          resolve({
            status: true,
            res
          })
        } else {
          resolve({
            status: false,
            message: body
          })
        }
      })
    })

    req.on('error', (err) => {
      resolve({
        status: false,
        message: '请求错误'
      });
    });

    req.write(data);

    req.end();
  })
}

function getBackendData() {
  return new Promise((resolve, reject) => {
    http.get({
      host: 'oa.njsecnet.com',
      port: '8080',
      path: '/weboa/auth/login!loginSuccess.action',
      headers: {
        'Cookie': cookieList.join('; '),
        'User-Agent': userAgent
      }
    }, (res) => {
      let body = '';
      res.on('data', function (chunk) {
        body += chunk;
      })
      res.on('end', function () {
        let userId = eval(body.match(/userId = (\S*);/)[1]);
        let realName = eval(body.match(/realName=(\S*);/)[1]);
        let _todayDate = eval(body.match(/_todayDate = (\S*);/)[1]);
        let _todayTime = eval(body.match(/_todayTime = (\S*);/)[1]);
        resolve({
          userId, realName, _todayDate, _todayTime
        })
      })
    })
  })
}

function getSignData(data) {
  return new Promise((resolve, reject) => {
    let req = http.request({
      method: 'post',
      host: 'oa.njsecnet.com',
      port: '8080',
      path: '/weboa/sign/signAction!saveComSing.action',
      headers: Object.assign({}, {
        'Cookie': cookieList.join('; '),
        'Content-Length': Buffer.byteLength(data),
        'Referer': 'http://oa.njsecnet.com:8080/weboa/auth/login!loginSuccess.action'
      }, headers)
    }, (res) => {
      let body = '';
      res.on('data', function (chunk) {
        body += chunk;
      })
      res.on('end', function () {
        body = JSON.parse(body);
        if (body.success) {
          resolve({
            status: true,
            message: '实际签到时间：' + body.errorMsg[0].msg
          })
        } else {
          resolve({
            status: false,
            message: body.result
          })
        }
      })
    });
    req.write(data);
    req.end();
  })
}

async function sign(userData) {
  let { status, res } = await checkAccount(userData);
  if (status) {
    cookieList = [
      'JSESSIONID=' + res.headers['set-cookie'][0].match(/=(\S*);/)[1],
      'authRememberMe=' + res.headers['set-cookie'][1].match(/=(\S*);/)[1],
      'authPassword=' + res.headers['set-cookie'][2].match(/=(\S*);/)[1],
      'authUserName=' + res.headers['set-cookie'][3].match(/=(\S*);/)[1],
      'authLoginIP=' + res.headers['set-cookie'][4].match(/=(\S*);/)[1],
      'authPoliceNo=' + res.headers['set-cookie'][5].match(/=(\S*);/)[1],
      'authLoginType=' + res.headers['set-cookie'][6].match(/=(\S*);/)[1],
      'authLoginMaC=' + res.headers['set-cookie'][7].match(/=(\S*);/)[1],
      'enrolledFingers=' + res.headers['set-cookie'][8].match(/=(\S*);/)[1]
    ];
    let { userId, realName, _todayDate, _todayTime } = await getBackendData();
    cookieList.push('SIGNCOOKIE=' + _todayDate);
    let data = querystring.stringify({
      macNum: hex_md5(userId + "\t" + realName + "\t" + _todayDate),
      sign_flag: "1",
      flag: Math.random(),
      shareNum: hex_md5(userId + "\t" + realName + "\t" + _todayTime)
    });
    return await getSignData(data);
  }
}

module.exports = { sign, checkAccount }