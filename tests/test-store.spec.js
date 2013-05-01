var fs = require('fs');
var shelljs = require('shelljs');

describe("test imgsizer store", function(){
  var Plasma = require("organic").Plasma;
  var plasma = new Plasma();

  var ImgSizer = require('../plasma/Imgsizer');
  var imgsizer = null;

  var imgsizerDNA = {
    uploadsDir: __dirname+"/uploads"
  }

  var testFile = {
    path: __dirname+"/data/img1"
  }

  it("instantiates organelle", function(next){
    imgsizer = new ImgSizer(plasma, imgsizerDNA);
    expect(imgsizer).toBeDefined();
    next();
  });

  it("send image to organelle", function(next){
    imgsizer.handleImage({
      target: testFile
    }, this, function(c){
      var expectedDestPath = imgsizerDNA.uploadsDir+"/img1";
      expect(fs.existsSync(expectedDestPath)).toBe(true);
      expect(c.data.path).toBe("img1");
      next();
    });
  })

  it('resolveImage path', function(next){
    imgsizer.resolveImage({
      target: "img1"
    }, this, function(c){
      var expectedDestPath = imgsizerDNA.uploadsDir+"/img1";
      expect(c.data).toBe(expectedDestPath);
      next();
    })
  })

  it("resolveImage path resized", function(next){
    imgsizer.resolveImage({
      target: "img1",
      width: "100"
    }, this, function(c){
      var expectedDestPath = imgsizerDNA.uploadsDir+"/.cache/img1/100xundefined";
      expect(c.data).toBe(expectedDestPath);
      expect(fs.existsSync(expectedDestPath)).toBe(true);
      next();
    })  
  })

  it("resolveImage path resized to max width", function(next){
    imgsizer.resolveImage({
      target: "img1",
      "max-width": "100"
    }, this, function(c){
      var expectedDestPath = imgsizerDNA.uploadsDir+"/.cache/img1/100xundefined";
      expect(c.data).toBe(expectedDestPath);
      expect(fs.existsSync(expectedDestPath)).toBe(true);
      next();
    })  
  })

  it("tears down", function(next){
    shelljs.rm('-rf', imgsizerDNA.uploadsDir);
    next();
  })
})