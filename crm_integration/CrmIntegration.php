<?php

class CrmIntegration
{

  private $cookiefilename = '';
  private $cookiepath = '';
  private $cookieurl = '';
  private $subdomain = '';
  private $userlogin = '';
  private $userhash = '';
  private $faund_mail = false;

  function __construct()
  {
    $this->cookiefilename = variable_get('crm_cookiefilename', 'cookie.txt');
    $this->cookiepath = variable_get('crm_cookiepath', 'public://crm_integration');
    $this->subdomain = variable_get('crm_subdomain', '');
    $this->userlogin = variable_get('crm_userlogin', '');
    $this->userhash = variable_get('crm_userhash', '');
    $this->cookieurl = $this->set_cookie_file();
    if ($this->cookieurl) {
      $this->crm_auth();
    }
  }

  private function set_cookie_file()
  {
    if (file_prepare_directory($this->cookiepath, FILE_CREATE_DIRECTORY)) {
      $real_path = drupal_realpath($this->cookiepath);
      if (!file_exists($real_path . '/' . $this->cookiefilename)) {
        file_save_data('', $this->cookiepath . '/' . $this->cookiefilename, FILE_EXISTS_REPLACE);
      }
      return $real_path . '/' . $this->cookiefilename;
    } else {
      watchdog('crm error', 'can create directory @path', array('@path' => $this->cookiepath));
      return false;
    }
  }

  private function crm_auth()
  {
    $link = 'https://' . $this->subdomain . '.amocrm.ru/private/api/auth.php?type=json';
    $data = array(
      'USER_LOGIN' => $this->userlogin,
      'USER_HASH' => $this->userhash
    );
    $this->crm_curl_sent($link, $data);
  }

  private function crm_curl_sent($link, $data)
  {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_USERAGENT, 'amoCRM-API-client/1.0');
    curl_setopt($curl, CURLOPT_URL, $link);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_COOKIEFILE, $this->cookieurl);
    curl_setopt($curl, CURLOPT_COOKIEJAR, $this->cookieurl);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
    $out = curl_exec($curl);
    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    if ((int)$code == 200) {
      return json_decode($out, true);
    } else {
      watchdog('crm error', $this->CheckCurlResponse($code));
      return false;
    }
  }

  private function CheckCurlResponse($code)
  {
    $code = (int)$code;
    $errors = array(
      301 => 'Moved permanently',
      401 => 'Unauthorized',
      403 => 'Forbidden',
      404 => 'Not found',
      500 => 'Internal server error',
      502 => 'Bad gateway',
      503 => 'Service unavailable',
      101 => 'Аккаунт не найден',
      102 => 'POST-параметры должны передаваться в формате JSON',
      103 => 'Параметры не переданы',
      104 => 'Запрашиваемый метод API не найден',
      201 => 'Добавление контактов: пустой массив',
      202 => 'Добавление контактов: нет прав',
      203 => 'Добавление контактов: системная ошибка при работе с дополнительными полями',
      204 => 'Добавление контактов: дополнительное поле не найдено',
      205 => 'Добавление контактов: контакт не создан',
      206 => 'Добавление/Обновление контактов: пустой запрос',
      207 => 'Добавление/Обновление контактов: неверный запрашиваемый метод',
      208 => 'Обновление контактов: пустой массив',
      209 => 'Обновление контактов: требуются параметры "id" и "last_modified"',
      210 => 'Обновление контактов: системная ошибка при работе с дополнительными полями',
      211 => 'Обновление контактов: дополнительное поле не найдено',
      212 => 'Обновление контактов: контакт не обновлён',
      213 => 'Добавление сделок: пустой массив',
      214 => 'Добавление/Обновление сделок: пустой запрос',
      215 => 'Добавление/Обновление сделок: неверный запрашиваемый метод',
      216 => 'Обновление сделок: пустой массив',
      217 => 'Обновление сделок: требуются параметры "id", "last_modified", "status_id", "name"',
      240 => 'Добавление/Обновление сделок: неверный параметр "id" дополнительного поля',
      218 => 'Добавление событий: пустой массив',
      221 => 'Список событий: требуется тип',
      222 => 'Добавление/Обновление событий: пустой запрос',
      223 => 'Добавление/Обновление событий: неверный запрашиваемый метод (GET вместо POST)',
      224 => 'Обновление событий: пустой массив',
      225 => 'Обновление событий: события не найдены',
      227 => 'Добавление задач: пустой массив',
      228 => 'Добавление/Обновление задач: пустой запрос',
      229 => 'Добавление/Обновление задач: неверный запрашиваемый метод',
      230 => 'Обновление задач: пустой массив',
      231 => 'Обновление задач: задачи не найдены',
      232 => 'Добавление событий: ID элемента или тип элемента пустые либо неккоректные',
      233 => 'Добавление событий: по данному ID элемента не найдены некоторые контакты',
      234 => 'Добавление событий: по данному ID элемента не найдены некоторые сделки',
      235 => 'Добавление задач: не указан тип элемента',
      236 => 'Добавление задач: по данному ID элемента не найдены некоторые контакты',
      237 => 'Добавление задач: по данному ID элемента не найдены некоторые сделки',
      238 => 'Добавление контактов: отсутствует значение для дополнительного поля',
      244 => 'Добавление сделок: нет прав.',
      400 => 'Неверная структура массива передаваемых данных, либо не верные идентификаторы кастомных полей',
      2002 => 'По вашему запросу ничего не найдено'
    );
    return $errors[$code] . ' - ' . $code;
  }

  public function crm_accounts_current()
  {
    $link = 'https://' . $this->subdomain . '.amocrm.ru/private/api/v2/json/accounts/current';
    $response = $this->crm_curl_get($link);
    return $response;
  }

  private function crm_curl_get($link)
  {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_USERAGENT, 'amoCRM-API-client/1.0');
    curl_setopt($curl, CURLOPT_URL, $link);
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_COOKIEFILE, $this->cookieurl);
    curl_setopt($curl, CURLOPT_COOKIEJAR, $this->cookieurl);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
    $out = curl_exec($curl);
    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    if ((int)$code == 200) {
      return json_decode($out, true);
    } else {
      watchdog('crm error', $this->CheckCurlResponse($code));
      return false;
    }
  }

  public function crm_find_contact($data)
  {
    $link = 'https://' . $this->subdomain . '.amocrm.ru/private/api/v2/json/contacts/list?query=' . $data['mail'];
    $response = $this->crm_curl_get($link);
    foreach ($response['response']['contacts'] as $key => $value) {
      $this->faund_mail = false;
      $this->check_correct_response($value, $data);
      if ($this->faund_mail) {
        break;
      }
    }
    if ($response == null || !$this->faund_mail) {
      $contact = $this->crm_set_contact($data);
      $data['resp_id'] = $contact['response']['contacts']['add'][0]['id'];
    } else {
      $data['resp_id'] = $response['response']['contacts'][$key]['id'];
      $data['name'] = $response['response']['contacts'][$key]['name'];
    }
    $notes = $this->crm_set_notes($data);
    $notes_by_user = $this->crm_get_notes($data);

    if(count($notes_by_user['response']['notes']) > 7){ // пора отправлять в сделки
      $leads_by_user = $this->crm_get_leads($data);
      if(!$leads_by_user){ // если нет сделок по пользователю, делаем
        $lead = $this->crm_set_leads($data);
      }
    }
//    return $notes;
    return $notes_by_user;
  }

  private function check_correct_response($response, $data)
  {
    foreach ($response as $key => $value) {
      if (is_array($value)) {
        $this->check_correct_response($value, $data);
      } else {
        if ($key == 'value' && $value == $data['mail']) {
          $this->faund_mail = true;
        }
      }
    }
  }

  public function crm_set_contact($data)
  {
    $link = 'https://' . $this->subdomain . '.amocrm.ru/private/api/v2/json/contacts/set';

    $custom_fields = array();
    if (!empty($data["mail"])) {
      $custom_fields[] = array('id' => '455130', 'values' => array(array("value" => $data["mail"], 'enum' => 'WORK')));
    }
    $contacts['request']['contacts']['add'] = array(
      array(
        'name' => $data["name"],
        'custom_fields' => $custom_fields
      )
    );
    $response = $this->crm_curl_sent($link, $contacts);
    return $response;
  }

  public function crm_set_notes($data)
  {
    $link = 'https://' . $this->subdomain . '.amocrm.ru/private/api/v2/json/notes/set';

    $notes['request']['notes']['add'] = array(
      array(
        'element_id' => $data['resp_id'],
        'element_type' => 1,
        'note_type' => 4,
        'text' => 'С cайт: https://www.litebooking.ru/; Заполнил форму: ' . $data['form_name'] . '; Дата: ' . date("F j, Y, g:i a") . '; ' . $data['comment']
      )
    );
    $response = $this->crm_curl_sent($link, $notes);
    return $response;
  }

  private function crm_get_notes($data){
    $link = 'https://' . $this->subdomain . '.amocrm.ru/private/api/v2/json/notes/list?type=contact&element_id='.$data['resp_id'];
    $response = $this->crm_curl_get($link);
    return $response;
  }

  private function crm_get_leads($data){
    $link = 'https://' . $this->subdomain . '.amocrm.ru/private/api/v2/json/leads/list?query='.$data['mail'];
    $response = $this->crm_curl_get($link);
    return $response;
  }

  public function crm_set_leads($data)
  {
    $link = 'https://' . $this->subdomain . '.amocrm.ru/private/api/v2/json/leads/set';

    $custom_fields = array();
    if (!empty($data["name"])) {
      $custom_fields[] = array(
        'id' => '549716',
        'values' => array(
          array(
            "value" => $data["name"]
          )
        )
      );
    }
    if (!empty($data["mail"])) {
      $custom_fields[] = array(
        'id' => '549730',
        'values' => array(
          array(
            "value" => $data["mail"]
          )
        )
      );
    }
    if (!empty($data['comment'])) {
      $custom_fields[] = array(
        'id' => '549734',
        'values' => array(
          array(
            "value" => $data['comment']
          )
        )
      );
    }
    $leads['request']['leads']['add'] = array(
      array(
        'name' => 'Много подписок на сайтах',
        'status_id' => 9277884,
        'responsible_user_id' => 530898,
        'tags' => 'Много подписок', #Теги
        'custom_fields' => $custom_fields
      )
    );
    $response = $this->crm_curl_sent($link, $leads);
    return $response;
  }
}