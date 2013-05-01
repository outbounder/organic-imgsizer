var Organel = require("organic").Organel;

var im = require('imagemagick');
var fs = require("fs");
var path = require("path");
var shelljs = require("shelljs");

module.exports = Organel.extend(function Imgsizer(plasma, config, parent){
  Organel.call(this, plasma, config, parent);

  var self = this;

  this.config.uploadsDir = config.uploadsDir || process.cwd()+"/uploads";

},{
  mountRoutes: function(c, sender, callback) {
    var self = this;
    c.data.app.post(self.config.uploadUrl, function(req, res){
      self.handleFiles({
        files: req.files
      }, self, function(c){
        res.send(c.data);
      })
    });
    c.data.app.get(self.config.downloadUrl+"/:filepath", function(req, res){
      var width = req.query.width;
      var height = req.query.height;
      self.resolveImage({
        width: width,
        height: height,
        filepath: req.params.filepath
      }, self, function(c){
        res.sendfile(c.data);
      })
    });

    // do not aggregate the chemical leaving it to plasma emit loop.
    return false; 
  },
  handleImages: function(c, sender, callback){
    var files = c.target; // formidable files array
    for(var key in files) {
      var file = files[key];
      shelljs.mkdir(this.config.uploadsDir);
      var dest = path.join(this.config.uploadsDir,path.basename(file.path));
      shelljs.cp(file.path, dest);
      file.path = dest;
    }
    if(callback) callback({data: files})
  },
  resolveImage: function(c, sender, callback) {
    var filepath = path.join(this.config.uploadsDir, c.target);
    if(c.width || c.height) {
      var resizedFilepath = path.join(this.config.uploadsDir, c.target, c.width+"x"+c.height);
      fs.exists(resizedFilepath, function(exists) {
        if(!exists) {
          im.resize({
            srcPath: filepath,
            dstPath: resizedFilepath,
            width: c.width,
            height: c.height
          }, function(err, stdout, stderr){
            if(err) throw err;
            if(callback) callback({data: resizedFilepath});
          })
        } else
          if(callback) callback({data: resizedFilepath});
      });
    } else
      if(callback) callback({data: filepath});
  }
});