function getDateStr(time) {
  var currentdate;
  if (time == -1) currentdate = new Date();
  else currentdate = new Date(time);
  return (
    currentdate.getDate() +
    '/' +
    (currentdate.getMonth() + 1) +
    '/' +
    currentdate.getFullYear() +
    ' ' +
    (currentdate.getHours() < 10 ? '0' : '') +
    currentdate.getHours() +
    ':' +
    (currentdate.getMinutes() < 10 ? '0' : '') +
    currentdate.getMinutes() +
    ':' +
    (currentdate.getSeconds() < 10 ? '0' : '') +
    currentdate.getSeconds()
  );
}

function getFileName() {
  return 'livechatible_backup_' + getDateStr(-1).replace(/\//g, '-').replace(/\:/g, '-').replace(/\s+/, '_') + '.json';
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function restore(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }

  var cf = confirm('Bạn có chắc muốn sử dụng bản sao lưu này?');
  if (!cf) return;

  $('#restore_status').html('Xin chờ...');

  var reader = new FileReader();
  reader.onload = function () {
    var data = JSON.parse(reader.result).chatRoom;
    makeRequest(
      '/admin/restore',
      'post',
      data,
      function () {
        if (res.success === true) {
          $('#restore_status').html('Đã khôi phục');
        } else {
          $('#restore_status').html('Lỗi!!!');
        }
      },
      function () {
        $('#restore_status').html('Lỗi gửi request!!!');
      }
    );
  };

  reader.onloadend = function () {
    if (reader.err) {
      $('#restore_status').html('File không hợp lệ!');
    }
  };

  reader.readAsText(file);
}

function getBackupFile() {
  $('#backup_btn').html('Xin chờ...');
  makeRequest('/admin/backup', 'get', {}, function (res) {
    if (res.error === true) {
      redirectToLogin();
      return;
    } else if (res.success === true) {
      let data = { chatRoom: res.chatRoom, waitRoom: res.waitRoom };
      download(getFileName(), JSON.stringify(data));
      $('#backup_btn').html('Tải bản sao lưu');
    }
  });
}

function resetDatabase() {
  var cf = confirm('Bạn có chắc chắn muốn xoá? Dữ liệu đã xoá không thể phục hồi!');
  if (cf) {
    $('#resetDb_btn').html('Xin chờ...');
    makeRequest(
      '/admin/db/reset',
      'post',
      {},
      function (res) {
        if (res.error === true && res.errortype === 'auth') {
          redirectToLogin();
          return;
        } else if (res.success === true) {
          alert('Đã xoá thành công!');
        } else {
          alert('Unknown error: ' + JSON.stringify(res));
        }
      },
      function () {
        alert('Unknown error:');
      }
    );
  }
}

function sendMessage() {
  var arr = $('#userid').val().split('\n');
  if(arr[0] == '') {
    $('#status').html('Đã có lỗi xảy ra vui lòng kiểm tra lại các ID');
    setTimeout(function () {
      $('#status').html('');
    }, 8000);
    return;
  }
  var listIDArray = [];
  //handler array
  for (let i = 0; i < arr.length; i++) {
    let newArr = arr[i].split('-');
    if (newArr.length != 1) newArr.pop();
    for (let j = 0; j < newArr.length; j++) {
      listIDArray.push(newArr[j].trim());
    }
  }
  for (let i = 0; i < listIDArray.length; i++) {
    makeRequest(
      '/admin/userinfo',
      'post',
      { id: listIDArray[i] },
      function (data) {
        if (data.error === true) {
          if (data.errortype === 'auth') {
            redirectToLogin();
          } else {
            $('#userinfo').html(`Couldn't get info for user ${listIDArray[i]}`);
          }
          return;
        }

        data = data.userProfile;
        
        var content = $('#content').val();
        content = content.replace('@name', data.name);

        makeRequest('/admin/sendmessage', 'post', { id: listIDArray[i], content: content }, function (data) {
          if (data.error === true) {
          }
        });
      },
      function (xhr, ajaxOptions, thrownError) {
        $('#userinfo').text(thrownError);
      }
    );
  }
  $('#status').html('Đã gửi');
  setTimeout(function () {
    $('#status').html('');
  }, 5000);
}

function checkInfo() {
  var id = $('#id').val();
  makeRequest(
    '/admin/userinfo',
    'post',
    { id: id },
    function (data) {
      if (data.error === true) {
        if (data.errortype === 'auth') {
          redirectToLogin();
        } else {
          $('#userinfo').html(`Couldn't get info for user ${id}`);
        }
        return;
      }

      data = data.userProfile;

      $('#userinfo').html(`<b>ID: ${id}</><br>${data.name} (<i>${data.gender == 'male' ? 'Nam' : 'Nữ'}</i>)<br>
                          <img src="${data.profile_pic}" width="100px"/><br>`);
    },
    function (xhr, ajaxOptions, thrownError) {
      $('#userinfo').text(thrownError);
    }
  );
}

!(function ($) {
  $(document).on('click', 'ul.nav li.parent > a > span.icon', function () {
    $(this).find('em:first').toggleClass('glyphicon-minus');
  });
  $('.sidebar span.icon').find('em:first').addClass('glyphicon-plus');
})(window.jQuery);

$(window).on('resize', function () {
  if ($(window).width() > 768) $('#sidebar-collapse').collapse('show');
});

$(window).on('resize', function () {
  if ($(window).width() <= 767) $('#sidebar-collapse').collapse('hide');
});

makeRequest(
  '/admin/version',
  'get',
  {},
  function (res) {
    $('#version').text(res);
  },
  function () {
    $('#version').text('Không rõ');
  }
);
