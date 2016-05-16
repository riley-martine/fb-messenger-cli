var request = require('request'); // For making HTTP requests
var rp = require('request-promise');
var vm = require('vm');

var Messenger = function(recipient, recipientId, cookie, userId, fbdtsg) {
  this.recipientUrl = "https://www.messenger.com/t/" + recipient; // Your recipient;
  this.recipientId = recipientId; // recipientId
  this.cookie = cookie; // Your cookie;
  this.userId = userId; // Your userID;
  this.fbdtsg = fbdtsg;
};

Messenger.prototype.sendMessage = function(body, callback) {
  var messenger = this;
  var utcTimestamp = new Date().getTime();
  var localTime = new Date().toLocaleTimeString().replace(/\s+/g, '').toLowerCase();

  request.post("https://www.messenger.com/ajax/mercury/send_messages.php?dpr=1", {
    headers: {
      'origin': 'https://www.messenger.com',
      'accept-encoding': 'gzip, deflate',
      'x-msgr-region': 'ATN',
      'accept-language': 'en-US,en;q=0.8',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded',
      'accept': '*/*',
      'referer': messenger.recipientUrl,
      'cookie': messenger.cookie,
      'authority': 'www.messenger.com'
    },
    formData: {
      'message_batch[0][action_type]':'ma-type:user-generated-message',
      'message_batch[0][author]':'fbid:' + messenger.userId,
      'message_batch[0][timestamp]': utcTimestamp,
      'message_batch[0][timestamp_absolute]':'Today',
      'message_batch[0][timestamp_relative]': localTime,
      'message_batch[0][timestamp_time_passed]':'0',
      'message_batch[0][is_unread]':'false',
      'message_batch[0][is_forward]':'false',
      'message_batch[0][is_filtered_content]':'false',
      'message_batch[0][is_filtered_content_bh]':'false',
      'message_batch[0][is_filtered_content_account]':'false',
      'message_batch[0][is_filtered_content_quasar]':'false',
      'message_batch[0][is_filtered_content_invalid_app]':'false',
      'message_batch[0][is_spoof_warning]':'false',
      'message_batch[0][source]':'source:messenger:web',
      'message_batch[0][body]': body,
      'message_batch[0][has_attachment]':'false',
      'message_batch[0][html_body]':'false',
      'message_batch[0][specific_to_list][0]':'fbid:' + messenger.recipientId,
      'message_batch[0][specific_to_list][1]':'fbid:' + messenger.userId,
      'message_batch[0][status]':'0',
      //'message_batch[0][offline_threading_id]': messageId,
      //'message_batch[0][message_id]': messageId,
      'message_batch[0][ephemeral_ttl_mode]':'0',
      'message_batch[0][manual_retry_cnt]':'0',
      'message_batch[0][other_user_fbid]': messenger.recipientId,
      'client':'mercury',
      '__user': messenger.userId,
      '__a':'1',
      '__req':'2q',
      '__be':'0',
      '__pc':'EXP1:messengerdotcom_pkg',
      'fb_dtsg': messenger.fbdtsg,
      'ttstamp':'265817073691196867855211811758658172458277511215256110114',
      '__rev':'2335431'
    }
  }, function(err, httpResponse, body) {
    if (err) {
      callback(err);
    }
  });
};

Messenger.prototype.getLastMessage = function(callback) {
  var messenger = this;
  var offSetString = 'messages[user_ids][' + messenger.recipientId + '][offset]';
  var limitString = 'messages[user_ids][' + messenger.recipientId + '][limit]';
  var timestampString = 'messages[user_ids][' + messenger.recipientId + '][timestamp]';

  var options = {
    url: 'https://www.messenger.com/ajax/mercury/thread_info.php?dpr=1',
    headers: {
      'origin': 'https://www.messenger.com',
      'accept-encoding': 'gzip, deflate',
      'x-msgr-region': 'ATN',
      'accept-language': 'en-US,en;q=0.8',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded',
      'accept': '*/*',
      'cache-control': 'max-age=0',
      'authority': 'www.messenger.com',
      'cookie': messenger.cookie,
      'referer': messenger.recipientUrl
    },
    formData: {
      'client':'mercury',
      '__user':messenger.userId,
      '__a':'1',
      '__req':'6',
      '__dyn':'7AzkXh8Z398jgDxKy1l0BwRyaF3oyfJLFwgoqwWhEoyUnwgU9GGEcVovkwy3eE99XDG4UiwExW14DwPxSFEW2O9xicG4EnwkUC9z8Kew',
      '__be':'0',
      '__pc':'EXP1:messengerdotcom_pkg',
      'ttstamp':'265817076671037767104101908958658169691168682107102105117104',
      'fb_dtsg': messenger.fbdtsg,
      '__rev':'2336846'
    },
    gzip: true,
  };
  
  options.formData[offSetString] = '0';
  options.formData[limitString] = '20';
  
  request.post(options, function(err, response, body){
        if (body.indexOf('for (;;);') == 0) {body = body.substr('for (;;);'.length)};
        
        json = JSON.parse(body);
        msg = json['payload']['actions'];
        
        data = [];
        
        for (i = 0; i < msg.length; ++i) {
            m = msg[i];
            obj = {
                'author': m['author'],
                'body': m['body'],
                'other_user_fbid': m['other_user_fbid'],
                'thread_fbid': m['thread_fbid'],
                'timestamp': m['timestamp'],
                'timestamp_datetime': m['timestamp_datetime']
            }
            
            data.push(obj);
        }
        
        callback(data);
    });
  
  // rp(options)
    // .then(function(body){
        // console.log(body);
        // if (body.indexOf('for (;;);') == 0) {body = body.substr('for (;;);'.length)};
        
        // json = JSON.parse(body);
        // console.log(json);
      // // jsonpSandbox = vm.createContext({callback: function(r){return r;}});
      // // parsedBody = vm.runInContext(body,jsonpSandbox);
      // // callback(false, parsedBody);
    // })
    // .catch(function(err){
      // callback("Error happened in vm : " + err);
    // });

  // request.post('https://www.facebook.com/ajax/mercury/thread_info.php?dpr=1', {
  //   headers: {
  //     'origin': 'https://www.messenger.com',
  //     'accept-encoding': 'gzip, deflate',
  //     'x-msgr-region': 'ATN',
  //     'accept-language': 'en-US,en;q=0.8',
  //     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
  //     'content-type': 'application/x-www-form-urlencoded',
  //     'accept': '*/*',
  //     'referer': messenger.recipientUrl,
  //     'cookie': messenger.cookie,
  //     'authority': 'www.messenger.com'
  //   },
  //   formData: {
  //     offSetString : '1',
  //     limitString : '20',
  //     'client':'mercury',
  //     '__user':'512556997',
  //     '__a':'1',
  //     '__dyn':'7AzkXh8Z398jgDxKy1l0BwRyaF3oyfJLFwgoqwWhEoyUnwgU9GGEcVovkwy3eE99XDG4UiwExW14DwPxSFEW2O7EOEixu1jyoCcyUW',
  //     '__req':'5',
  //     '__be':'0',
  //     '__pc':'EXP1:messengerdotcom_pkg',
  //     'fb_dtsg':'AQG6Jrs1CKiJ:AQF6DSaM1AMk',
  //     'ttstamp':'2658171547411411549677510574586581705468839777496577107',
  //     '__rev':'2335772'
  //   },
  //   gzip: true
  // }, function(err, response, body) {
  //   if (err) {
  //     callback(err);
  //   }
  //   callback(false, body);
  // });
};

Messenger.prototype.getThreads = function(callback) {
  var messenger = this;
  
  var options = {
    url: 'https://www.messenger.com/ajax/mercury/threadlist_info.php?dpr=1',
    headers: {
      'origin': 'https://www.messenger.com',
      'accept-encoding': 'gzip, deflate',
      'x-msgr-region': 'ATN',
      'accept-language': 'en-US,en;q=0.8',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded',
      'accept': '*/*',
      'cache-control': 'max-age=0',
      'authority': 'www.messenger.com',
      'cookie': messenger.cookie,
      'referer': messenger.recipientUrl
    },
    formData: {
      'inbox[offset]': '0',
      'inbox[filter]' : '',
      'inbox[limit]' : '10',
      'client':'mercury',
      '__user':messenger.userId,
      '__a':'1',
      '__req':'8',
      '__be':'0',
      '__pc':'EXP1:messengerdotcom_pkg',
      'ttstamp':'2658170878850518911395104515865817183457873106120677266',
      'fb_dtsg': messenger.fbdtsg,
      '__rev':'2338802'
    },
    gzip: true,
  };
  
  request.post(options, function(err, response, body){
        if (body.indexOf('for (;;);') == 0) {body = body.substr('for (;;);'.length)};
        
        json = JSON.parse(body);
        participants = json['payload']['participants'];
        threads = json['payload']['threads'];
        
        data = [];
        
        for (i = 0; i < participants.length; ++i) {
            name = participants[i]['name'];
            
            for (j = 0; j < threads.length; ++j) {
                if (threads[j]['other_user_fbid'] == participants[i]['fbid']) {
                    data.push({'name': name, 'snippet' : threads[j]['snippet']});
                    break;
                }
            }
        }
        
        callback(data);
    });

};

module.exports = Messenger;
