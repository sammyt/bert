var Benchmark = require('benchmark')
var suite = new Benchmark.Suite
var bert = require('../bert')

function toBuf(arr){
  var uints = new Uint8Array(arr)
  return uints.buffer
}

var buf = toBuf([ 131, 108, 0, 0, 0, 3, 70, 63, 241, 153, 153, 153, 153,
                153, 154, 70, 64, 2, 102, 102, 102, 102, 102, 102, 70, 64,
                26, 102, 102, 102, 102, 102, 102, 106])

suite.add('decode [1.1, 2.3, 6.6]', function(){
  bert.decode(buf)
})

suite.on('cycle', function(event){
  console.log(String(event.target))
})

suite.run()
