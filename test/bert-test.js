var expect = require("expect.js")
var bert   = require("../bert")

function toBuf(arr){
  var uints = new Uint8Array(arr)
  return uints.buffer
}

describe("bert", function(){

  describe("decoding", function(){

    it('of a string "sunrise"', function(){
      var buf = toBuf([131, 109, 0, 0, 0, 7, 115, 117, 110, 114, 105, 115, 101])
      var str = bert.decode(buf)
      expect(str).to.eql("sunrise")
    })

    it("of an atom :happy", function(){
      var buf = toBuf([131, 100, 0, 5, 104, 97, 112, 112, 121])
      var atom = bert.decode(buf)
      expect(atom).to.eql(":happy")
    })

    it('of an int 3044', function(){
      var buf = toBuf([131, 98, 0, 0, 11, 228])
      var num = bert.decode(buf)
      expect(num).to.eql(3044)
    })

    it('of a float 3.14', function(){
      var buf = toBuf([131, 70, 64, 9, 30, 184, 81, 235, 133, 31])
      var num = bert.decode(buf)
      expect(num).to.eql(3.14)
    })

    it('of a tuple {:hi, "sam"}', function(){
      var buf = toBuf([131, 104, 2, 100, 0, 2, 104, 105, 109, 0, 0, 0, 3, 115, 97, 109])
      var tup = bert.decode(buf)
      expect(tup).to.eql([":hi", "sam"])
    })

    it('of a list [1,2,3]', function(){
      var buf = toBuf([131,108,0,0,0,3,97,1,97,2,107,0,2,104,105,106])
      var arr = bert.decode(buf)
      expect(arr).to.eql([1,2,"hi"])
    })
  })
})
