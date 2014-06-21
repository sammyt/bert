module.exports = {
  decode: decode
}

var slice = [].slice
var assert = function(truth, msg){
  if(!truth) throw new Error(msg)
}

function dispatch(){
  var fns = slice.call(arguments, 0)
  return function(it){
    var ans, fn
    for(var i = 0; i < fns.length; i++){
      fn  = fns[i]
      ans = fn(it)

      if(ans !== undefined) {
        return ans
      }
    }
    return ans
  }
}

function when(pred, fn){
  return function(it){
    if(pred(it)) return it.next(), fn(it)
  }
}

function hasTermId(id){
  return function(it) {
    return it.peek() === id
  }
}


var SMALL_INT   = hasTermId(97)
var INT         = hasTermId(98)
var OLD_FLOAT   = hasTermId(99)
var ATOM        = hasTermId(100)
var SMALL_TUPLE = hasTermId(104)
var LARGE_TUPLE = hasTermId(105)
var NIL         = hasTermId(106)
var STRING      = hasTermId(107)
var LIST        = hasTermId(108)
var BINARY      = hasTermId(109)
var SMALL_BIG   = hasTermId(110)
var LARGE_BIG   = hasTermId(111)
var FLOAT       = hasTermId(70)

var _decode = dispatch(

  when(ATOM,        decodeAtom),
  when(SMALL_INT,   decodeSmallInt),
  when(INT,         decodeInt),
  when(FLOAT,       decodeFloat),
  when(BINARY,      decodeString),
  when(STRING,      decodeSimpleString),
  when(LIST,        decodeList),
  when(SMALL_TUPLE, decodeTuple),
  when(LARGE_TUPLE, decodeTuple),
  when(NIL,         decodeNil),
  when(SMALL_BIG,   decodeBigNum),
  when(LARGE_BIG,   decodeBiggerNum)

)

function decode(buffer) {
  var it = new Iterator(new Uint8Array(buffer))
  assert(131 === it.next(), 'oops, where is the magic 131?') 
  return _decode(it)
}

var text = require('text-encoding')
var utf8Dec = new text.TextDecoder('utf8')

function intOfLen(len){
  return function(it){
    var i = len -1
    var ans = 0
    while(i >= 0){
      ans += it.next() << (i * 8)
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

function decodeNil(it){
  return null
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
  return it.next()
}

function decodeInt(it){
  return int4(it)
}

var ieee754 = require('ieee754')

function decodeFloat(it){
  return ieee754.read(it.segment(8), 0, false, 52, 8)
}

function decodeBigNum(it){
  var n = it.next()
  var sign = it.next() == 0 ? 1 : -1 
  var ans = 0
  var i = 0

  while(i < n){
    ans += Math.pow(256, i++) * it.next()
  }

  return sign * ans 
}

function decodeBiggerNum(it){
  var n = int2(it)
  var sign = it.next() == 0 ? 1 : -1 
  var ans = 0
  var i = 0

  while(i < n){
    ans += Math.pow(256, i++) * it.next()
  }

  return sign * ans 
}

function decodeTuple(it){
  var len = it.next()
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


function Iterator(arr){
  this.i = 0
  this.arr = arr
}

Iterator.prototype.next = function(){
  return this.arr[this.i++]
}

Iterator.prototype.peek = function(){
  return this.arr[this.i]
}

Iterator.prototype.segment = function(len){
  var i = this.i
  var seg = this.arr.subarray(i, len + i) 
  this.i += len
  return seg
}

