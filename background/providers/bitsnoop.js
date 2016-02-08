'use strict';

// We need to follow redirects otherwise the first request is a 302 redirect - This helper module does this automatically
var http = require('follow-redirects').http;
var url = require('url');
var zlib = require('zlib');
var path = require('path');
var nconf = require('nconf');

var log = require(__dirname + '/../logging.js');

var Provider = require(__dirname + '/provider.js');

var interval;

/**
 * @summary
 * Retrieves torrents from the BitSnoop API
 * @constructor
 * @param {string} provider - The name of the provider. This is used to retrieve config values from the config.json file
 * @param {string} url - The URL to send requests to
 * @description
 * The BitSnoop API is documented at the following web page (http://bitsnoop.com/info/api.html). The BitSnoop API can do
 * multiple things such as detect whether or not a torrent is fake or return a list of trackers tracking a torrent. However
 * we are only interested in the hourly and daily exports.
 * @example
 * var BitSnoop = require(__dirname + '/bitsnoop.js');
 * new BitSnoop('bitsnoop-hourly','http://bitsnoop.com/api/latest_tz.php?t=verified').startup();
 * @see bitsnoop-hourly.js or bitsnoop-daily.js
 */
class BitSnoop extends Provider {
    constructor(provider, url) {
      super(provider); // Calls the superclass constructor (Provider) with the value of provider
      this.url = url;
    }
    run() {
        http.get({
          hostname: url.parse(this.url).hostname,
          port: 80,
          path: url.parse(this.url).path,
          headers: {
            // Without a user-agent set the BitSnoop api returns HTTP 503 - Service Unavailable
            'User-Agent': 'Bitcannon (http://github.com/bitcannon-org/bitcannon-web)',
            // Tell the server we accept gzip encoding. Note: hourly dumps ignore this and are outputted in plain text
            // Daily dumps appear to output correctly but have a mime type of application/octet-stream instead of application/x-gzip
            'Accept-Encoding': 'gzip' 
          }
        }, function (res) {
            // torrent_info_hash|torrent_name|torrent_category|torrent_info_url|torrent_download_url
            if (
              res.headers['content-type'] === 'application/x-gzip' ||
              res.headers['content-type'] === 'application/octet-stream' ||
              res.headers['content-type'] === 'text/plain; charset=UTF-8'
            ) {
                // pipe the response into the gunzip to decompress
                var gunzip = zlib.createGunzip();
                res.pipe(gunzip);

                gunzip.on('data', function (data) {
                    var lines = data.toString().split(/\r?\n/);
                    lines.forEach(function (line) {
                        line = line.split('|');
                        if(line.length > 1) {
                            log.info('Processing ' + line[1]);
                            Provider.addTorrent(
                                line[1], // title
                                line[2], // category / aliases
                                undefined, // size
                                line[3], // details
                                undefined, // swarm
                                Date.now(), // lastmod
                                Date.now(), // imported
                                line[0] // infoHash
                            );
                        }
                    });
                }).on('error', function (err) {
                    log.warn(err);
                }).on('end', function () {

                });
            } else {
                console.dir(res);
                log.error('An unknown error occurred!');
                clearInterval(interval);
            }
        }).on('error', function (err) {
            log.warn(err);
        });
    }
    startup() {
        if(this.runAtStartup) {
            this.run();
        }
        if (!isNaN(this.duration)) {
            interval = setInterval(this.run, this.duration);
        } else {
            log.warn('Invalid duration for provider kat');
        }
    }
}

module.exports = BitSnoop;
