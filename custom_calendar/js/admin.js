/**
 * Created by denis on 17.12.14.
 */
jQuery(function() {
  jQuery('#calendar').datepick({
    multiSelect: 999,
    monthsToShow: [2, 5],
    onSelect: customRange
  });

  function customRange(dates) {
    var to_input = [];
    for(var i=0; i<dates.length; i++){
      to_input[i] = dates[i].getDate()+'/'+(dates[i].getMonth()+1)+'/'+dates[i].getFullYear();
    }
    if (this.id == 'calendar') {
      jQuery('#start_days').val(to_input.join(', '));
    }
    var dates_q = jQuery('#calendar').datepick('getDate');
  }

  jQuery('#send_it').click(function(){
    var dates = jQuery('#calendar').datepick('getDate');
    var days = jQuery('#count_days');
    var to_send = [];
    for(var i=0; i<dates.length; i++){
      var day = dates[i].getDate();
      var month = dates[i].getMonth()+1;
      var year = dates[i].getFullYear();
      to_send[i] = day+'/'+month+'/'+year;
    }
    var to_send_string = to_send.join(',');
    days.removeClass('error');

    if(dates.length>0 && days.val() == ""){
      days.addClass('error');
    }else{
      jQuery.ajax({
        url: Drupal.settings.booking_calendar.url + '/' + Drupal.settings.booking_calendar.nid,
        data: {
          'dates_start' : to_send_string,
          'tour_days' : days.val(),
          'type' : 'saveCalendar',
          'destination': $_GET('destination'),
          'param' : Drupal.settings.booking_calendar.type
        },
        type:"POST"
      }).done(function(rez) {
        console.log(rez);
        if(rez['status'] == 'error'){
          alert(rez['data']);
        }else{
         jQuery(location).attr('href','/'+rez['data']);
        }
      });
    }

    return false;
  });

  jQuery('#start_days').focusout(function(){
    check_content();
  });
//  jQuery('#start_days').keyup(function(){
//    check_content();
//  });
  function check_content(){
    var dates_date = [];
    var dates = jQuery('#start_days').val().split(',');
    for(var i = 0; i<dates.length; i++){
      array_for_date = dates[i].split('/');
      dates_date[i] = new Date(array_for_date[2], array_for_date[1]-1, array_for_date[0]);
    }
    console.log(dates_date);
    jQuery('#calendar').datepick('setDate', dates_date);
  }

});

function $_GET(key) {
  var s = window.location.search;
  s = s.match(new RegExp(key + '=([^&=]+)'));
  return s ? decodeURI(s[1]) : false;
}

jQuery(window).load(function(){
  jQuery.ajax({
    url: Drupal.settings.booking_calendar.url + '/' + Drupal.settings.booking_calendar.nid,
    data: {
      'type' : 'adminCalendar',
      'param' : Drupal.settings.booking_calendar.type
    }
  }).done(function(rez) {
    console.log(rez);
    var dates_date = [];
    var dates = rez['data']['start_dates'].split(',');
    for(var i = 0; i<dates.length; i++){
      array_for_date = dates[i].split('/');
      dates_date[i] = new Date(array_for_date[2], array_for_date[1]-1, array_for_date[0]);
      //dates_date[i] = new Date(dates[i]);
    }
    console.log(dates_date);
    jQuery('#calendar').datepick('setDate', dates_date);
    jQuery('#count_days').val(rez['data']['tour_days']);

  });
});
