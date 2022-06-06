
if (getAppToken() !== null) {
  checkToken(
    getAppToken(),
    function (res) {
      if (res.success === true) {
        window.location.href = '/admin.html';
      } else {
        redirectToLogin();
      }
    },
    function () {
      redirectToLogin();
    }
  );
}

  $('.wrapper').addClass('form-success');
  $('form').fadeOut(500);
  $('#loading').fadeIn(500);

var host = 'https://svchatbot.tk';
  setAppUrl(host);
  var d = new Date();
  var time = d.getTime();
  var pwd = CryptoJS.SHA256('loczippo').toString();
  var token = {
    time: time,
    hash: CryptoJS.SHA256(time + '' + pwd).toString()
  };
  token = CryptoJS.AES.encrypt(JSON.stringify(token), pwd).toString();
  setTimeout(function () {
    checkToken(
      token,
      function (res) {
        if (res.success === true) {
          setAppToken(token);
          window.location.href = '/admin.html';
        } else if (res.error === true && res.errortype === 'auth') {
          alert('Sai mật khẩu!');
          redirectToLogin();
        } else {
          alert('Có lỗi xảy ra!');
          redirectToLogin();
        }
      },
      function () {
        alert('Lỗi kết nối!');
        redirectToLogin();
      }
    );
  }, 500);

// $('#login-button').click(function (event) {
//   event.preventDefault();

//   $('.wrapper').addClass('form-success');
//   $('form').fadeOut(500);
//   $('#loading').fadeIn(500);
  
//   var host = 'https://newchatible.herokuapp.com';
//   setAppUrl(host);
//   var d = new Date();
//   var time = d.getTime();
//   var pwd = CryptoJS.SHA256('loczippo').toString();
//   var token = {
//     time: time,
//     hash: CryptoJS.SHA256(time + '' + pwd).toString()
//   };
//   token = CryptoJS.AES.encrypt(JSON.stringify(token), pwd).toString();
//   setTimeout(function () {
//     checkToken(
//       token,
//       function (res) {
//         if (res.success === true) {
//           setAppToken(token);
//           window.location.href = '/admin.html';
//         } else if (res.error === true && res.errortype === 'auth') {
//           alert('Sai mật khẩu!');
//           redirectToLogin();
//         } else {
//           alert('Có lỗi xảy ra!');
//           redirectToLogin();
//         }
//       },
//       function () {
//         alert('Lỗi kết nối!');
//         redirectToLogin();
//       }
//     );
//   }, 500);
// });
