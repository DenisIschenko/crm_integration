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

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteCookie(name) {
  setCookie(name, "", {
    expires: -1
  })
}

var calendarData = [];
var nowMounth = false;
var minDateTour;
var selectedDate;// = getCookie("book_call_sel_date");
var selectedDate1 = getCookie("book_call_sel_date");
deleteCookie('book_call_sel_date');

var nowday = new Date().getDate();
var nowmounth = new Date().getMonth() + 1;
var nowyear = new Date().getFullYear();
var selectedDateAr = [nowday, nowmounth, nowyear];
if(selectedDate1 != undefined){
  selectedDateAr = selectedDate1.split('/');
}

deleteCookie("book_call_sel_date");


jQuery.fn.live = function (types, data, fn) {
  jQuery(this.context).on(types, this.selector, data, fn);
  return this;
};

jQuery(function () {
  pageTitle = jQuery(document).find('h1').html();
  calenarOpen(Drupal.settings.booking_calendar.nid);
//  jQuery(document).on('click', '#edit-submitted-vybrat-datu', function () {
//    calenarOpenByClick();
//  });

});

(function ($, Drupal, window, document, undefined) {
  Drupal.behaviors.bookCalendar = {
    attach: function (context, settings) {
      if(jQuery(context).find('input[name="submitted[vybrat_datu]"]').length > 0){
        jQuery(context).find('input[name="submitted[vybrat_datu]"]').val(selectedDate);
        if(!jQuery(context).find('input[name="submitted[vybrat_datu]"]').hasClass('hasDatepick')){
          calenarOpenByClick(jQuery(context).find('input[name="submitted[vybrat_datu]"]'));
        }
      }
//      jQuery(context).find('.webform-component--so-stranicy input[name="submitted[so_stranicy]"]').val(pageTitle);
//      jQuery(context).find('input[name="submitted[so_stranicy]"]').prop('readonly',false).val(pageTitle).prop('readonly',true);
    }
  };
})(jQuery, Drupal, this, this.document);

function calenarOpen(nid) {
  jQuery('.hasDatepick').hide();
  jQuery('.calendar').append('<div id="loading_ajax" style="z-index:5000; position: absolute; top: 40px; left: -7px; width: 240px; height: 240px; text-align: center; background: url(/sites/all/modules/custom_calendar/img/progress-back.png);"> <img style="top: 50%; position: absolute; left: 50%; margin-left: -16px; margin-top: -16px;" src="/sites/all/modules/custom_calendar/img/progress.gif"/></div>');
  jQuery.ajax({
    url: Drupal.settings.booking_calendar.url + '/' + nid,
    data: {
      type: 'loadCalendar'
    }
  }).done(function (rez) {
    console.log(rez);
    calendarData = rez['date'];
    minDateTour = rez['minDate'].split('/');
    initCalendar('calendar' + nid);
    jQuery('#loading_ajax').remove();
    return false;
  });
}

function initCalendar(id) {
  jQuery('#' + id).show();
  var block = 0;
  jQuery('#' + id).datepick({
    changeMonth: true,
    rangeSelect: false,
    minDate: new Date(minDateTour[2], minDateTour[1] - 1, minDateTour[0]),//new Date(),
    monthsToShow: 1,
    defaultDate: new Date(selectedDateAr[2], selectedDateAr[1] - 1, selectedDateAr[0]),
    onShow: function (date, drawDate) {
      nowMounth = drawDate.drawDate;
    },
    renderer: jQuery.extend({}, jQuery.datepick.defaultRenderer,
        {picker: jQuery.datepick.defaultRenderer.picker.
            replace(/\{link:prev\}/, '').
            replace(/\{link:next\}/, '').
            replace(/\{link:today\}/, '<div class="mounth">' + Drupal.t("Select month") + '</div>')
        }),

    onDate: function (date, current) {
      var currentTime = new Date();
      var day = date.getDate();
      var mounth = date.getMonth() + 1;
      var year = date.getFullYear();
      if (calendarData[year + '/' + mounth + '/' + day] != undefined) {
        var param = calendarData[year + '/' + mounth + '/' + day]['param'];
        var blocked = calendarData[year + '/' + mounth + '/' + day]['blocked'];
        var title = '';
        var color = '';
        var block = false;

        if (blocked !== false) {
          title = '';
          color = blocked;
          if (param == 2) {
            block = false;
//            color = 'grey';
          } else {
            if (currentTime < date) {
              block = true;
            } else {
              block = false;
              color = 'grey';
            }
          }

        } else {
          title = '';
          color = '';
          block = false;
        }
      } else {
        block = false;
        title = '';
        color = '';
      }

      return {
        dateClass: 'showDoY ' + color,
        selectable: block,
        title: ' ',
        content: '<div class="day" >' + date.getDate() + '</div>'
      };
    },

    onSelect: function (dates) {
      var date = new Date();
      date.setTime(dates[0].getTime());
      var day = date.getDate();
      var mounth = date.getMonth() + 1;
      var year = date.getFullYear();

      selectedDate = day + '/' + mounth + '/' + year;

      if (jQuery("#simple-dialog-container").length != 0) {
        jQuery("#simple-dialog-container").remove();
      }
      if (jQuery("#simple-dialog-container").length == 0) {
        // Add a container to the end of the body tag to hold the dialog
        jQuery('body').append('<div id="simple-dialog-container" style="display:none;"></div>');
        try {
          // Attempt to invoke the simple dialog
          jQuery("#simple-dialog-container").dialog({
            autoOpen: false,
            modal: true,
            close: function (event, ui) {
              // Clear the dialog on close. Not necessary for your average use
              // case, butis useful if you had a video that was playing in the
              // dialog so that it clears when it closes
              jQuery('#simple-dialog-container').html('');
            }
          });
          var defaultOptions = Drupal.simpleDialog.explodeOptions(Drupal.settings.simpleDialog.defaults);
          jQuery('#simple-dialog-container').dialog('option', defaultOptions);
        }
        catch (err) {
          // Catch any errors and report
          Drupal.simpleDialog.log('[error] Simple Dialog: ' + err);
        }
      }

      var url = jQuery('.block-custom-calendar').find('a.dialog').attr('href');
      // Use default title if not provided
      var title = jQuery('.block-custom-calendar').find('a.dialog').attr('title') ? jQuery('.block-custom-calendar').find('a.dialog').attr('title') : Drupal.settings.simpleDialog.title;
      if (!title) {
        title = jQuery('.block-custom-calendar').find('a.dialog').text();
      }
      // Use defaults if not provided
      var selector = jQuery('.block-custom-calendar').find('a.dialog').attr('name') ? jQuery('.block-custom-calendar').find('a.dialog').attr('name') : Drupal.settings.simpleDialog.selector;
      var options = jQuery('.block-custom-calendar').find('a.dialog').attr('rel') ? Drupal.simpleDialog.explodeOptions(jQuery('.block-custom-calendar').find('a.dialog').attr('rel')) : Drupal.simpleDialog.explodeOptions(Drupal.settings.simpleDialog.defaults);
//        var options = Drupal.simpleDialog.explodeOptions("width:300;height:auto;position:[center,60];show:[effect:'blind',duration:100];hide:[effect:'explode',duration:100]");
      if (url && title && selector) {
        // Set the custom options of the dialog
        jQuery('#simple-dialog-container').dialog('option', options);

        // Set the title of the dialog
        jQuery('#simple-dialog-container').dialog('option', 'title', title);

        // Add a little loader into the dialog while data is loaded
        jQuery('#simple-dialog-container').html('<div class="simple-dialog-ajax-loader"></div>');
        // Change the height if it's set to auto
        if (options.height && options.height == 'auto') {
          jQuery('#simple-dialog-container').dialog('option', 'height', 200);
        }
        // Use jQuery .get() to request the target page
        jQuery.get(url, function (data) {
          // Re-apply the height if it's auto to accomodate the new content
          if (options.height && options.height == 'auto') {
            jQuery('#simple-dialog-container').dialog('option', 'height', options.height);
          }
          // Some trickery to make sure any inline javascript gets run.
          // Inline javascript gets removed/moved around when passed into
          // jQuery() so you have to create a fake div and add the raw data into
          // it then find what you need and clone it. Fun.
          jQuery('#simple-dialog-container').html(jQuery('<div></div>').html(data).find('#' + selector).clone());
          // Attach any behaviors to the loaded content
          Drupal.attachBehaviors(jQuery('#simple-dialog-container'));
          // Trigger a custom event
          jQuery('#simple-dialog-container').trigger('simpleDialogLoaded');
        });
        // Open the dialog
        jQuery('#simple-dialog-container').dialog('open');
        // Return false for good measure
        return false;
      }
      return false;
    }
  });
}

function calenarOpenByClick(id) {
  var nid = Drupal.settings.booking_calendar.nid
  if(!jQuery.isEmptyObject(calendarData)){
    initCalendarOnClick(id);
  }else{
    jQuery('#loading_ajax').remove();
    jQuery('#simple-dialog-container').append('<div id="loading_ajax" style="z-index:5000; position: absolute; top: 0; left: 0; width: 100%; height: 100%; text-align: center; background: url(/sites/all/modules/custom_calendar/img/progress-back.png);"> <img style="top: 50%; position: absolute; left: 50%; margin-left: -16px; margin-top: -16px;" src="/sites/all/modules/custom_calendar/img/progress.gif"/></div>');
    jQuery.ajax({
      url: Drupal.settings.booking_calendar.url + '/' + nid,
      data: {
        type: 'loadCalendar'
      }
    }).done(function (rez) {
      calendarData = rez['date'];
      minDateTour = rez['minDate'].split('/');
      initCalendarOnClick(id);
      jQuery('#loading_ajax').remove();
    });
  }
}

function initCalendarOnClick(id) {
//  jQuery(id).show();
  var block = 0;
  id.datepick({
    changeMonth: false,
    rangeSelect: false,
    minDate: new Date(minDateTour[2], minDateTour[1] - 1, minDateTour[0]),//new Date(),
    monthsToShow: 1,
    defaultDate: new Date(selectedDateAr[2], selectedDateAr[1] - 1, selectedDateAr[0]),
    renderer: jQuery.extend({}, jQuery.datepick.defaultRenderer,
        {picker: jQuery.datepick.defaultRenderer.picker.
            replace(/\{link:today\}/, '').
            replace(/\{link:clear\}/, '').
            replace(/\{link:close\}/, '')
        }),
    onDate: function (date, current) {
      var currentTime = new Date();
      var day = date.getDate();
      var mounth = date.getMonth() + 1;
      var year = date.getFullYear();
      if (calendarData[year + '/' + mounth + '/' + day] != undefined) {
        var param = calendarData[year + '/' + mounth + '/' + day]['param'];
        var blocked = calendarData[year + '/' + mounth + '/' + day]['blocked'];
        var title = '';
        var color = '';
        var block = false;

        if (blocked !== false) {
          title = '';
          color = blocked;
          if (param == 2) {
            block = false;
          } else {
            if (currentTime < date) {
              block = true;
            } else {
              block = false;
            }
          }

        } else {
          title = '';
          color = '';
          block = false;
        }
      } else {
        block = false;
        title = '';
        color = '';
      }

      return {
        dateClass: 'showDoY ' + color,
        selectable: block,
        title: ' ',
        content: '<div class="day" >' + date.getDate() + '</div>'
      };
    },

    onSelect: function (dates) {
      var day = dates[0].getDate();
      var mounth = dates[0].getMonth() + 1;
      var year = dates[0].getFullYear();
      selectedDate = day + '/' + mounth + '/' + year;
      jQuery('#edit-submitted-vybrat-datu').val(day + '/' + mounth + '/' + year);
//      jQuery(this).hide();
      return false;
    }
 });
}