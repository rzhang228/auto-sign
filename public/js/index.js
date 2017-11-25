const { ipcRenderer } = require('electron');

let isRememberUsername = false;
let isRememberPassword = false;

function getSearchParam() {
  var url = location.search;
  var theRequest = new Object();
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }
  return theRequest;
}

function addEvent() {
  $('#submit').on('click', function () {
    let username = $('#username').val();
    let password = $('#password').val();
    let time = $('#time input').val();
    isRememberUsername = $('#remember-username').prop('checked');
    isRememberPassword = $('#remember-password').prop('checked');
    ipcRenderer.send('start-auto-sign', {
      username, password, time, isRememberUsername, isRememberPassword
    });
  })
  $('.check-label').on('click', function (event) {

    let $checkbox = $(this).find('input');
    let nowStatu = $checkbox.prop('checked');

    if ('remember-password' === $checkbox.attr('id')) {
      $(this).siblings().find('input').prop('checked', nowStatu);
    }
  })
}

module.exports = {
  init: function () {
    let defaultData = getSearchParam();
    if (defaultData.username) $('#username').val(defaultData.username);
    if (defaultData.password) $('#password').val(defaultData.password);
    let temorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    temorrow.setHours('08');
    temorrow.setMinutes('30');
    temorrow.setSeconds('00');
    $('#time').datetimepicker({
      format: 'YYYY-MM-DD hh:mm:ss',
      locale: moment.locale('zh-cn'),
      defaultDate: temorrow
    });
    addEvent();
  }
}