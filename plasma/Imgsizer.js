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
  if(this.config.cwd)
    for(var key in this.config.cwd)
      this.config[key] = path.join(process.cwd(), this.config.cwd[key]);

  this.config.uploadsDir = config.uploadsDir || process.cwd()+"/uploads";
  
  shelljs.mkdir('-p', this.config.uploadsDir);

  this.on("Imgsizer:handleImage", this.handleImage);
  this.on("Imgsizer:resolveImage", this.resolveImage);

},{
  handleImage: function(c, sender, callback){
    var file = c.target;
    var dest = path.join(this.config.uploadsDir, path.basename(file.path));
    if(file.path !== dest)
      ncp(file.path, dest, function(err){
        if(err) return callback(err);
        file.path = path.basename(file.path);  
        callback({data: file});
      });
    else {
      file.path = path.basename(file.path);
      callback({data: file});
    }
  },
  resolveImage: function(c, sender, callback) {
    var filepath = path.join(this.config.uploadsDir, c.target);
    var self = this;
    if(c.width || c.height)
      self.resizeImage(c, sender, callback);
    else
    if(c['max-width'] || c['max-height'])
      im.identify(filepath, function(err, features){
        if(err) return callback(err);

        if( (c["max-width"] && parseInt(c["max-width"]) < features.width) ||
            (c["max-height"] && parseInt(c["max-height"]) < features.height) ){
          if(c["max-width"])
            c.width = c["max-width"];
          if(c["max-height"])
            c.height = c["max-height"];
          self.resizeImage(c, sender, callback);
        } else
          callback({data: filepath});
      })
    else
      callback({data: filepath});
  },
  resizeImage: function(c, sender, callback) {
    var filepath = path.join(this.config.uploadsDir, c.target);
    var resizedFilepath = path.join(this.config.uploadsDir, ".cache", c.target, c.width+"x"+c.height);

    fs.exists(resizedFilepath, function(exists) {
      if(!exists) {
        mkdirp(path.dirname(resizedFilepath), function(err){
          if(err) return callback(err);

          var resizeOptions = _.extend({
            srcPath: filepath,
            dstPath: resizedFilepath
          }, c);
          
          // clean up width & height from options if not defined 
          // otherwise resize method fails.
          if(typeof resizeOptions.width == "undefined")
            delete resizeOptions.width;
          if(typeof resizeOptions.height == "undefined")
            delete resizeOptions.height;

          im.resize(resizeOptions, function(err, stdout, stderr){
            if(err) return callback(err);
            callback({data: resizedFilepath});
          })  
        });
      } else
        callback({data: resizedFilepath});
    });
  }
});