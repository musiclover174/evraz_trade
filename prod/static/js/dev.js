(function() {
  $('.contacts__form').submit(function(){ // пример работы с формой
    if (window.evraz.form.checkForm($(this)[0])){
      // ajax here
      $.fancybox.open({
        src: '#text'
      });
      $('.contacts__form')[0].reset();
    }
    return false;
  })
})()