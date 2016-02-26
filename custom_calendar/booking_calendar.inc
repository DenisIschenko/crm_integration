<?php
/**
 * Created by PhpStorm.
 * User: denis
 * Date: 13.03.15
 * Time: 10:19
 */

function calendar_page($form, &$form_state){
  global $language;
  $nodes = _get_nodes('2', $language->language);
  $drop = array_pop($nodes);
  $drop = array_pop($nodes);
  $nodes1 = $nodes;
  $month = array (1 => t('January'), 2 => t('February'), 3 => t('March'), 4 => t('April'), 5 => t('May'), 6 => t('June'),
                       7 => t('July'), 8 => t('August'), 9 => t('September'), 10 => t('October'), 11 => t('November'), 12 => t('December'));
  $year = array(2013=>'2013',2014=>'2014',2015=>'2015',2016=>'2016',2017=>'2017',2018=>'2018');
  $cur_year = date("Y");
  $cur_month = date("n");


  $form['tour'] = array(
      '#type' => 'select',
      '#title' => t('Programs'),
      '#options' => $nodes,
      '#default_value' => array_shift($nodes1),
  );
//  $form['month'] = array(
//      '#type' => 'select',
//      '#title' => t('from month'),
//      '#options' => $month,
//      '#default_value' => $cur_month,
//  );
  $form['year'] = array(
      '#type' => 'select',
      '#title' => t('Year'),
      '#options' => $year,
      '#default_value' => $cur_year,
  );

  return $form;
}

function _get_nodes($type, $lang){
//  $query = db_select('node', 'n')
//          ->fields('n', array('nid', 'title'))
//          ->condition('n.status', 1)
//          ->condition('n.type', $type)
//          ->condition('n.language', $lang)
//          ->execute()
//          ->fetchAllKeyed();
  $query = db_select('taxonomy_term_data', 'td')
          ->fields('td', array('tid', 'name'))
          ->condition('td.vid', $type)
      ->orderBy('td.weight', 'ASC')
//          ->condition('td.language', $lang)
      ->execute()
      ->fetchAllKeyed();
  return $query;
}

function calendar_page_all(){
  global $language;

  $path_lib = libraries_get_path('datepick');
  drupal_add_js($path_lib.'/jquery.datepick.js');
  drupal_add_js($path_lib.'/jquery.datepick-'.$language->language.'.js');
  drupal_add_css($path_lib.'/jquery.datepick.css');

  $path_module = drupal_get_path('module', 'custom_calendar');
  drupal_add_js($path_module.'/js/user.js');
  drupal_add_css($path_module.'/css/booking_calendar.css');
  drupal_add_css($path_module.'/css/user.css');
  drupal_add_js(
      array(
          'booking_calendar' => array(
              'url' => url(CALENDAR_URL),
              'type' => 'user_show'
          )
      ),
      'setting'
  );

  return '<div class="page_conteiner" style="padding-bottom:30px">
  <div class="block-title">'.t('Calendar').'</div>
  <div class="legend"><div class="available"><span></span>'.t('available').'</div><div class="places_left"><span></span>'.t('1-2 places left').'</div><div class="occupied"><span></span>'.t('occupied').'</div></div>
  '.render(drupal_get_form('calendar_page')).'

  <div class="calendar"><div id="calendar"></div></div>
  </div>';
}