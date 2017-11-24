function addEvent() {
  $('#submit').on('click', function (event) {
    let username = $('#username').val();
    let password = $('#password').val();
    let time = $('#time input').val();
    console.log(username, password, time);
  })
  $('.check-label').on('click', function (event) {
    event.preventDefault();

    let $checkbox = $(this).find('input');
    let nowStatu = $checkbox.prop('checked');
    $checkbox.prop('checked', !nowStatu);

    if ('remember-password' === $checkbox.val()) {
      $(this).siblings().find('input').prop('checked', !nowStatu);
    }
  })
}

module.exports = {
  init: function () {
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