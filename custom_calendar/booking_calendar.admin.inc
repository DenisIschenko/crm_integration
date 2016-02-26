<?php


/**
 * @file
 * Administrative page callbacks for the redirect module.
 */

function booking_calendar_list_form($form, &$form_state) {

  $destination = drupal_get_destination();

  // Set up the header.
  $header = array(
      'title' => array('data' => t('Title'), 'field' => 'title', 'sort' => 'asc'),
      'language' => array('data' => t('Language'), 'field' => 'language'),
      'operations' => array('data' => t('Operations')),
  );

  // Do not include the language column if locale is disabled.
  if (!module_exists('locale')) {
    unset($header['language']);
  }

  // Building the SQL query and load the redirects.
  $query = db_select('node', 'n')->extend('TableSort')->extend('PagerDefault');
  $query->addField('n', 'nid');
  $query->condition('n.type', 'tour');
  $query->orderByHeader($header);
  $query->limit(50);
  $nids = $query->execute()->fetchCol();
  $nodes = node_load_multiple($nids);


  $rows = array();
  foreach ($nodes as $nid => $node) {
    if($nid == '937'){
      $nid = '119';
    }
    $row = array();
    $row['title'] = $node->title;
    $row['language'] = module_invoke('locale', 'language_name', $node->language);

    $operations = array();

    $operations['edit_availability'] = array(
        'title' => t('Edit availability'),
        'href' => 'admin/config/booking_calendar/edit_availability/' . $nid,
        'query' => $destination,
    );
    $operations['edit_inaccessibility'] = array(
        'title' => t('Edit inaccessibility'),
        'href' => 'admin/config/booking_calendar/edit_inaccessibility/' . $nid,
        'query' => $destination,
    );
    $operations['edit_places_left'] = array(
        'title' => t('Edit 1-2 places left'),
        'href' => 'admin/config/booking_calendar/edit_places_left/' . $nid,
        'query' => $destination,
    );
    $row['operations'] = array(
        'data' => array(
            '#theme' => 'links',
            '#links' => $operations,
            '#attributes' => array('class' => array('links', 'inline', 'nowrap')),
        ),
    );

    $rows[$nid] = $row;
  }

  $form['nids'] = array(
      '#type' => 'tableselect',
      '#header' => $header,
      '#options' => $rows,
      '#empty' => t('No URL redirects available.'),
  );
  $form['pager'] = array('#theme' => 'pager');
  return $form;
}

function booking_calendar_edit($nid, $type){
  global $language;

  $path_lib = libraries_get_path('datepick');
  drupal_add_js($path_lib.'/jquery.datepick.js');
  drupal_add_js($path_lib.'/jquery.datepick-'.$language->language.'.js');
  drupal_add_css($path_lib.'/jquery.datepick.css');

  $path_module = drupal_get_path('module', 'custom_calendar');
  drupal_add_js($path_module.'/js/admin.js');
  drupal_add_css($path_module.'/css/admin.css');
  drupal_add_js(
      array(
          'booking_calendar' => array(
              'url' => url(CALENDAR_URL),
              'nid' => $nid,
              'type' => $type
          )
      ),
      'setting'
  );

  return '
  <div class="calendar_container">
    <div id="calendar"></div>
    <div class="description_calendar">Дни начала тура</div>
    <textarea id="start_days" style="width: 98%"></textarea>
    <input type="text" id="count_days" placeholder="Введите продолжительность тура" />
    <input type="submit" id="send_it" value="Done">
  </div>
  ';
}