var fs = require('fs');
var shelljs = require("shelljs");

describe("test imgsizer store", function(){
  var Plasma = require("organic").Plasma;
  var plasma = new Plasma();

  var ImgSizer = require('../plasma/Imgsizer');
  var imgsizer = null;

  var imgsizerDNA = {
    uploadsDir: __dirname+"/uploads"
  }

  var testFiles = {
    "file": {
      path: __dirname+"/data/img1"
    }
  }

  it("instantiates organelle", function(next){
    imgsizer = new ImgSizer(plasma, imgsizerDNA);
    expect(imgsizer).toBeDefined();
    next();
  });

  it("posts some files already stored to organelle", function(next){
    imgsizer.handleImages({
      files: testFiles
    }, this, function(c){
      var expectedDestPath = imgsizerDNA.uploadsDir+"/img1";
      expect(fs.existsSync(expectedDestPath)).toBe(true);
      expect(c.data['file'].path).toBe(expectedDestPath);
      next();
    });
  })

  it('resolveImage path', function(next){
    imgsizer.resolveImage({
      target: "img1"
    }, this, function(c){
      var expectedDestPath = imgsizerDNA.uploadsDir+"/img1";
      expect(c.data).toBe(expectedDestPath);
    })
  })

  it("resolveImage path resized", function(next){
    imgsizer.resolveImage({
      target: "img1",
      width: "100"
    }, this, function(c){
      var expectedDestPath = imgsizerDNA.uploadsDir+"/.cache/img1_100x";
      expect(c.data).toBe(expectedDestPath);
      expect(fs.existsSync(expectedDestPath)).toBe(true);
      next();
    })  
  })

  it("tears down", function(next){
    shelljs.rmdir('-rf', imgsizerDNA.uploadsDir);
    next();
  })
})