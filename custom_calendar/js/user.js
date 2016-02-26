/**
 * Created by denis on 13.03.15.
 */

var $nid, $year, minDateTour, calendarData;
var $month = new Date().getMonth() + 1;
var already_add_click = false;


jQuery(window).load(function () {
  var form_cont = jQuery('.page_conteiner');
  $nid = form_cont.find('select#edit-tour').val();
  $year = form_cont.find('select#edit-year').val();
  calenarOpen($nid);
});


function calenarOpen(nid) {
  jQuery('.tooltip_onclick').remove();
  jQuery('.tooltip').remove();
  jQuery('.hasDatepick').hide();
  jQuery('#calendar').datepick('destroy');
  jQuery('.calendar').append('<div id="loading_ajax" style="z-index:5000; position: absolute; top: 0; left: 0; width: 100%; height: 100%; text-align: center; background: url(/sites/all/modules/custom_calendar/img/progress-back.png);"> <img style="top: 50%; position: absolute; left: 50%; margin-left: -16px; margin-top: -16px;" src="/sites/all/modules/custom_calendar/img/progress.gif"/></div>');
  jQuery.ajax({
    url: Drupal.settings.booking_calendar.url + '/' + nid,
    data: {
      type: 'loadCalendarTid'
    }
  }).done(function (rez) {
//    console.log(rez);
    calendarData = rez['date'];
    minDateTour = rez['minDate'].split('/');
    initCalendar('calendar');
    initFunc('calendar');
    jQuery('#loading_ajax').remove();
    return false;
  });
}

function initCalendar(id) {
  jQuery('#' + id).show();
  var block = 0;
  jQuery('#' + id).datepick({
    changeMonth: false,
    rangeSelect: false,
    monthsToShow: [4, 3],
    onShow: function (date, drawDate) {
      nowMounth = drawDate.drawDate;
      date.find('td .datepick-other-month').parent().addClass('other-month');
      addEvent(date, drawDate);
    },
    renderer: jQuery.extend({}, jQuery.datepick.defaultRenderer,
        {picker: jQuery.datepick.defaultRenderer.picker.
            replace(/\{link:prev\}/, '').
            replace(/\{link:next\}/, '').
            replace(/\{link:today\}/, '')
        }),

    onDate: function (date, current) {
      var currentTime = new Date();

      var blocked = false;
      var title = '';
      var color = '';
      var count = 0;
      var selectable = false;
      var day = date.getDate();
      var mounth = date.getMonth() + 1;
      var year = date.getFullYear();

      if (calendarData[year + '/' + mounth + '/' + day] != undefined) {
        blocked = calendarData[year + '/' + mounth + '/' + day]['blocked'];
        if (blocked !== false) {
          title = calendarData[year + '/' + mounth + '/' + day]['title'];
          count = calendarData[year + '/' + mounth + '/' + day]['count'];
          color = blocked;
          if (currentTime < date) {
            selectable = true;
          } else {
            selectable = false;
          }
        } else {
          title = '';
          color = '';
          selectable = false;
        }
      } else {
        selectable = false;
        title = '';
        color = '';
      }
      return {
        dateClass: 'showDoY count-' + count + ' ' + color,
        selectable: selectable,
        title: ' ',
        content: '<div class="day" >' + date.getDate() + '</div><span class="title" style="display: none">' + title + '</span>'
      };
    },

    onSelect: function (dates) {
      return false;
    }
  });
}

function initFunc(id) {
  var form_cont = jQuery('.page_conteiner');
  form_cont.find('select').on("change", function () {
    if (form_cont.find('select#edit-tour').val() !== $nid) {
      $nid = form_cont.find('select#edit-tour').val();
      calenarOpen($nid);
    }
    $year = form_cont.find('select#edit-year').val();
    jQuery('#' + id).datepick('showMonth', $year, $month);

  });

  $year = form_cont.find('select#edit-year').val();
  jQuery('#' + id).datepick('showMonth', $year, $month);

  jQuery(document).on("mouseover", '#' + id + ' td > *', function (e) {
    var title = jQuery(this).find('span.title').html();
    if (jQuery(this)[0].tagName == 'SPAN') {
      clas = ' nonactive';
    } else {
      clas = ' active'
    }
//    console.log(jQuery(this)[0].tagName);
    jQuery('<div class="tooltip' + clas + '"></div>')
        .html(title)
        .appendTo('body')
        .fadeIn('slow');
  });
  jQuery(document).on("mouseleave", '#' + id + ' td > *', function (e) {
    jQuery('.tooltip').remove();
  });
  jQuery(document).on("mousemove", '#' + id + ' td > *', function (e) {
    var mousex = e.pageX + 20; //Get X coordinates
    var mousey = e.pageY + 10; //Get Y coordinates
    jQuery('.tooltip').css({ top: mousey, left: mousex })
  });

  jQuery(document).click(function(event) {
    if (jQuery(event.target).closest(".tooltip_onclick").length) return;
    jQuery('.tooltip_onclick').remove();
    jQuery('.tooltipOverlay').remove();
    event.stopPropagation();
  });

}

function addEvent(date, drawDate) {
  if(!already_add_click){
    already_add_click = true;

  jQuery(document).on("click", date.find('a.showDoY'), function (e) {
    var nodes = jQuery(e.target).parent('a.showDoY').find('span.title').children('div');
    if (nodes.length > 0) {
      var selected_date = jQuery('#calendar').datepick('getDate');
      selected_date = selected_date[0].getDate() + '/' + (selected_date[0].getMonth() + 1) + '/' + selected_date[0].getFullYear();
      setCookie("book_call_sel_date", selected_date);
      if (nodes.length > 1) {
        var text = '<div class="title">Какую программу открыть?</div>';
        nodes.each(
            function () {
              text += '<a href="' + jQuery(this).find('.id').html() + '" target="_blank">' + jQuery(this).html() + '</a>';
            }
        );
        text += '<span class="close"></span>';
        jQuery('.tooltip_onclick').remove();
        jQuery('.tooltipOverlay').remove();

        jQuery('<div class="tooltip_onclick"></div>')
            .html(text)
            .appendTo('body')
            .css({top: '40%',position: 'fixed', 'z-index': 1001})
            .fadeIn('slow');
        jQuery('<div class="tooltipOverlay"></div>')
            .appendTo('body')
            .css({top: 0, left: 0, position: 'fixed', width: '100%', height: "100%", 'z-index': 1000, background: '#000', opacity: '0.4'})
            .fadeIn('slow');
        jQuery('.tooltip_onclick .close').click(function(){
          jQuery('.tooltip_onclick').remove();
          jQuery('.tooltipOverlay').remove();
        });
        jQuery('.tooltip_onclick a').click(function(){
          jQuery('.tooltip_onclick').remove();
          jQuery('.tooltipOverlay').remove();
        });
      } else {
        var to_go = nodes.find('.id').html();
        window.open(
            to_go,
            '_blank' // <- This is what makes it open in a new window.
        );
        //jQuery(location).attr('href', to_go);
      }
      jQuery('.tooltip').remove();
    }
  });
  }
}

function setCookie(name, value, options) {
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}