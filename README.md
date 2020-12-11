# matchJS
A helper library that allows for pattern matching and simple sum types in JS.

### Create Sum Types with `union`

Create a sum type using the `union` function. This will return an object that represents the namespace of the union. `union` takes a string name and an object containing constructor functions. The object returned from your constructor represents the data you'd like the variant to represent:

```javascript
const { A, B } = union('AB', {
  A: value => ({value}),
  B: ()    => {},
})
```

### Match your types using `match`

We can match our sum types and perform operations using the matched variants' data.

```javascript
const myA = A(3)

const result = match(myA, {
  A: ({value}) => `Got A(${value})`,
  B: ()        => `Got B`
})

console.log(result) //=> "Got A(3)"
```

### Sum Types are Extensible
We can add functionality by modifying constructor prototypes:

```javascript
A.prototype.map = function(f) {
  return A(f(this.value))
}

let nine = A(3).map(x => x*x) //=> A(9)
```

### Compatible with Native Types
We can even match regular types:

```javascript
const myStr = "some string"

const result = match(myStr, {
  String: s => s,
  _: () => "didn't get string"
})
```

