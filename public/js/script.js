$(document).ready(function(){
  'use strict';

  $("#btn_send").click(function(e){
    //alert($("#email-editor").html());
    //alert($("#email-editor").code());
    $.get("/send", {
      subject: $("#subject").val(),
      text: $("#email-editor").code()
    }, function(response){
        location.href = '/';
    });
    e.preventDefault();
  });

  $.get("/getAll", function(response){
      console.log(response);

      $.each(response, function(key, value){
        $(".email-list").append('<div class="item" onclick="location.href=\'/view/'+value._id+'\'"><div><div class="am-checkbox"><input id="check3" type="checkbox"><label for="check3"></label></div></div><div><span class="date pull-right"><i class="icon s7-paperclip"></i>'+value.published_date.substring(0,10)+'</span><h4 class="from">John Doe</h4><p class="msg">'+value.subject+'</p></div></div>');
      });


  });


});
