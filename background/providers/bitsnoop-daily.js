'use strict';

var nconf = require('nconf');

var BitSnoop = require(__dirname + '/bitsnoop.js');

switch(nconf.get('providers:bitsnoop-daily:config:verified')) {
  case false:
    // If verified is set to false then we request all torrents
    new BitSnoop('bitsnoop-daily','http://ext.bitsnoop.com/export/b3_all.txt.gz').startup();
    break;
  case true:
  default:
    // If verified is true, isn't specified or is but isn't true or false then we default to fetching verified torrents only
    new BitSnoop('bitsnoop-daily','http://ext.bitsnoop.com/export/b3_verified.txt.gz').startup();
    break;
}