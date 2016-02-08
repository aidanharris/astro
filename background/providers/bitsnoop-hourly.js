'use strict';

var nconf = require('nconf');

var BitSnoop = require(__dirname + '/bitsnoop.js');

switch(nconf.get('providers:bitsnoop-hourly:config:verified')) {
  case false:
    // If verified is set to false then we request all torrents from the last hour
    new BitSnoop('bitsnoop-hourly','http://bitsnoop.com/api/latest_tz.php?t=all').startup();
    break;
  case true:
  default:
    // If verified is true, isn't specified or is but isn't true or false then we default to fetching verified torrents only
    new BitSnoop('bitsnoop-hourly','http://bitsnoop.com/api/latest_tz.php?t=verified').startup();
    break;
}