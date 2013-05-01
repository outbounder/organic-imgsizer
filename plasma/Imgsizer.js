var Organel = require("organic").Organel;

var _ = require("underscore");

var im = require('imagemagick');

var fs = require("fs");
var path = require("path");

var ncp = require('ncp');
var mkdirp = require("mkdirp");
var shelljs = require("shelljs");

module.exports = Organel.extend(function Imgsizer(plasma, config, parent){
  Organel.call(this, plasma, config, parent);

  var self = this;

  this.config.uploadsDir = config.uploadsDir || process.cwd()+"/uploads";
  
  shelljs.mkdir('-p', this.config.uploadsDir);

},{
  handleImage: function(c, sender, callback){
    var file = c.target;
    var dest = path.join(this.config.uploadsDir, path.basename(file.path));
    
    ncp(file.path, dest, function(err){
      if(err) throw err;
      file.path = dest;  
      if(callback) callback({data: file});
    });
  },
  resolveImage: function(c, sender, callback) {
    var filepath = path.join(this.config.uploadsDir, c.target);
    if(c.width || c.height) {
      var resizedFilepath = path.join(this.config.uploadsDir, ".cache", c.target, c.width+"x"+c.height);

      fs.exists(resizedFilepath, function(exists) {
        if(!exists) {
          mkdirp(path.dirname(resizedFilepath), function(err){
            if(err) throw err;
            var resizeOptions = _.extend({
              srcPath: filepath,
              dstPath: resizedFilepath
            }, c);
            im.resize(resizeOptions, function(err, stdout, stderr){
              if(err) throw err;
              if(callback) callback({data: resizedFilepath});
            })  
          });
        } else
          if(callback) callback({data: resizedFilepath});
      });
    } else
      if(callback) callback({data: filepath});
  }
});