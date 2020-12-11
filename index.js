const property    = Object.getOwnPropertyDescriptor,
      defprop = Object.defineProperty,
      entries = Object.entries,
      symbols = Object.getOwnPropertySymbols,
      keys    = Object.keys

const TAG    = Symbol.for('tag-sym'),
      TYPE   = Symbol.for('type-sym'),
      MATCH  = Symbol.for('match-sym'),
      SECRET = Symbol.for('secret'),
      WILD   = '_'

const REGISTERED_TYPES = {}
const register_type = (type, tags) => {
  if(REGISTERED_TYPES[type]) err(`There is already a type registered with name '${type}'`)
  REGISTERED_TYPES[type] = {}
  keys(tags).forEach(tag => REGISTERED_TYPES[type][tag] = tag)
} 

Function.prototype[TAG] = 'Function'
Object.prototype[TAG]   = 'Object'
String.prototype[TAG]   = 'String'
Array.prototype[TAG]    = 'Array'
Number.prototype[TAG]   = 'Number'
Boolean.prototype[TAG]  = 'Boolean'

Object.prototype[TYPE]  = 'NativeType'
register_type('NativeType', {
  Object:'Object',
  Array:'Array',
  String:'String',
  Number:'Number',
  Boolean:'Boolean',
  Function:'Function'
})

Object.prototype[MATCH] = function(pattern) {
  return (
    this[TAG] in pattern ? pattern[this[TAG]](this)
  : WILD in pattern      ? pattern[WILD]()
  : /*else*/               err(`expected '${this[TAG]}' or '${WILD}' to be in pattern.`)
  )
}
function err(e) { throw new Error(e) } //helper 

const extend = (t, ...exts) => {
  exts.forEach(ext => {
    entries(ext).forEach(([k,v]) => {
      k === 'prototype' ? t[k] = v
    : /*else*/            defprop(t, k, property(ext, k))
    })
    symbols(ext).forEach(s => {
      defprop(t, s, property(ext, s))
    })
  })
}

function Matchable(type, tag, pvt) {
  this[TAG] = tag
  this[TYPE] = type
  this[SECRET] = pvt
  this[MATCH] = function(pattern) {
    return (
      tag in pattern  ? pattern[tag](pvt)
    : WILD in pattern ? pattern[WILD]()
    : /*else*/         err(`no match found for '${tag}'`)
    )
  }
}
 
const match = (instance, pattern) => {
  keys(pattern).forEach(k => {
    const T = REGISTERED_TYPES[instance[TYPE]]
    if(!(k in T) && !(k === WILD))
      err(`Pattern provided to match includes keys not in type '${instance[TYPE]}'`)
  })
  if(!instance[TAG]) err('no TAG symbol in instance')
  return instance[MATCH](pattern)
}

const union = (name, constructors) => {
  const T = {} 
  const tags = {}
  
  entries(constructors).forEach(([tag, ctor]) => { 
    tags[tag] = tag
    function result(...args) {
      const pvt = ctor(...args) || {}
      Matchable.call(this, name, tag, pvt)
    }
    
    T[tag] = (...args) => new result(...args)
  })
  register_type(name, tags)
  return T
}
