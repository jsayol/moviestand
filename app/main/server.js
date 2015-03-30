moviesServices.factory('HTTPStreamerFactory', [
  function() {
    var http = require('http')
    var fs = require('fs')
    var path = require('path')
    var files = []

    var host = '127.0.0.1'
    var port = 1337

    http.createServer(function (req, res) {
      try {
        var file = files[req.url.substr(1)]
        var stat = fs.statSync(file)
        var ext = path.extname(file)

        if (['.mp3', '.avi', '.mp4', '.mkv', '.flv', '.ogv', '.ogg'].indexOf(ext) >= 0) {
          var type
          switch (ext) {
            case '.mp3':
              type = 'audio/mpeg'
              break
            case '.avi':
              type = 'video/avi'
              break
            case '.mp4':
              type = 'video/mp4'
              break
            case '.mkv':
              type = 'video/x-matroska'
              break
            case '.flv':
              type = 'video/x-flv'
              break
            case '.ogv':
            case '.ogg':
              type = 'video/ogg'
              break
          }

          var status
          var headers = {
            'Content-Type': type
          }

          var streamOptions = {}

          if (req.headers.range) {
            status = 206
            var range = req.headers.range.match(/bytes=(\d+)-(\d*)/)
            var start = 1*range[1] || 0
            var end = 1*range[2] || (stat.size - 1)
            streamOptions.start = start
            streamOptions.end = end
            headers['Content-Range'] = 'bytes '+start+'-'+end+'/'+stat.size
            headers['Content-Length'] = end - start + 1
          }
          else {
            status = 200
            headers['Accept-Ranges'] = 'bytes'
            headers['Content-Length'] = stat.size
          }

          res.writeHead(status, headers)

          var readStream = fs.createReadStream(file, streamOptions)
          readStream.pipe(res)
          console.log('Streaming file: '+file)
        }
        else {
          res.end('Looks like this file cannot be played.')
        }
      } catch (e) {
        res.end('File doesn\'t exists... Or some other error.')
      }
    }).listen(port, host)

    return {
      getURL: function(pos) {
        return 'http://'+host+':'+port+'/' + (typeof pos != 'undefined' ? pos : '')
      },
      addFile: function(file) {
        var pos = $.inArray(files, file)
        if (pos > -1) {
          return this.getURL(pos)
        }
        else {
          files.push(file)
          return this.getURL(files.length - 1)
        }
      }
    }
  }
])
