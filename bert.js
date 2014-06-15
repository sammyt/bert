module.exports = {
  decode: decode
}

var slice = [].slice
var assert = function(truth, msg){
  if(!truth) throw new Error(msg)
}

function dispatch(){
  var fns = slice.call(arguments, 0)
  return function(){
    var args = slice.call(arguments, 0) 
    var ans, fn
    for(var i = 0; i < fns.length; i++){
      fn  = fns[i]
      ans = fn.apply(fn, args)
      if(ans) return ans
    }
    return ans
  }
}

function when(pred, fn){
  return function(it){
    if(pred(it)) return it(), fn(it)
  }
}

function hasTermId(id){
  return function(it) {
    return it.peek() === id
  }
}

var ATOM        = hasTermId(100)
var BINARY      = hasTermId(109)
var STRING      = hasTermId(107)
var INT         = hasTermId(98)
var SMALL_INT   = hasTermId(97)
var FLOAT       = hasTermId(70)
var SMALL_TUPLE = hasTermId(104)
var LIST        = hasTermId(108)

var _decode = dispatch(

  when(ATOM,        decodeAtom),
  when(INT,         decodeInt),
  when(SMALL_INT,   decodeSmallInt),
  when(FLOAT,       decodeFloat),
  when(BINARY,      decodeString),
  when(STRING,      decodeSimpleString),
  when(LIST,        decodeList),
  when(SMALL_TUPLE, decodeTuple)

)

function decode(buffer) {
  var it = iterator(new Uint8Array(buffer))
  assert(131 === it(), 'oops, where is the magic 131?') 
  return _decode(it)
}

var text = require('text-encoding')
var utf8Dec = new text.TextDecoder('utf8')

function intOfLen(len){
  return function(it){
    var i = len -1
    var ans = 0
    while(i >= 0){
      ans += it() << (i * 8)
      i--
    }
    return ans
  }
}

var int2 = intOfLen(2)
var int4 = intOfLen(4)

function decodeAtom(it){
  var len = int2(it)
  return ':' + utf8Dec.decode(it.segment(len))
}

function decodeString(it){
  var len = int4(it)
  return utf8Dec.decode(it.segment(len))
}

function decodeSimpleString(it){
  var len = int2(it)
  return utf8Dec.decode(it.segment(len))
}


function decodeSmallInt(it){
  return it()
}

function decodeInt(it){
  return int4(it)
}

var ieee754 = require('ieee754')

function decodeFloat(it){
  return ieee754.read(it.segment(8), 0, false, 52, 8)
}

function decodeTuple(it){
  var len = it()
  var tup = []
  for(var i = 0; i < len; i++){
    tup.push(_decode(it))
  }
  return tup
}

function decodeList(it){
  var len = int4(it) 
  var tup = []
  for(var i = 0; i < len; i++){
    tup.push(_decode(it))
  }
  return tup

}

function iterator(arr) {
  var i = 0
  var next = function(){
    return arr[i++]
  }
  next.peek = function(){
    return arr[i]
  }
  next.segment = function(len){
    var seg =  arr.subarray(i, len + i)
    i+= len
    return seg
  }
  return next
}


