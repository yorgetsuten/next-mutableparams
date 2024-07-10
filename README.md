## Install
```
npm i next-mutableparams
```
```
pnpm i next-mutableparams
```
```
yarn add next-mutableparams
```
## useMutableParams
``` ts
'use client'

import { useMutableParams } from 'next-mutableparams'

type Schema = Partial<{
  q: string
  page: number
  previous: number[]
  theme: 'dark' | 'light'
}>

export default function Theme() {
  const [state, searchParams] = useMutableParams<Schema>()
  
  const setDark = () => searchParams.set('theme', 'dark')
  const setLight = () => searchParams.set('theme', 'light')

  return (
    <div>
      <h1>Current theme: {state.theme}</h1>
      <button onClick={setDark}>Set theme to dark</button>
      <button onClick={setLight}>Set theme to light</button>
    </div>
  )
}
```

Returns a state object of the current search params and an object of methods alike to ones in [URLSearchParams interface](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams). 
```
const [state, searchParams] = useMutableParams()
```
The difference is that all the data you operate with is serialized and deserialized in the process, so you can even store multi-dimensional arrays in the search params if you want to. Due to that fact, there is no need in [.append()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/append) and [.getAll()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/getAll) methods, instead, .set() and .get() methods do their job.

### `searchParams.set(key, value, options?)`
Sets the value associated with a given search parameter to the given value which will be serialized. Custom serializer can be provided as hook option `useMutableParams<Schema>({ serializer })`. 
Will not cause an update of `searchParams`, by default will only update the `state` of the same hook instance.
```ts
const [state, searchParams] = useMutableParams<Schema>()
const [state2, searchParams2] = useMutableParams<Schema>()

useEffect(() => {
  searchParams.set('q','foo')
}, [searchParams])

useEffect(() => {
  console.log(state.q) // will be logged once
}, [state.q])

useEffect(() => {
  console.log(state2.q) // will not be logged
}, [state2.q])
```
If you want update `state` of other hook instances as well, the `syncState` option will help you with that. By providing it as a hook option, you "allow" other hook instances to update its state. These instances must also provide the`syncState` option either as hook option or as method option. The option specified in hook will be treated as the new default behaviour, while the option specified in method will have a higher priority. This is true for all other options as well.
```ts
const [state, searchParams] = useMutableParams<Schema>({ syncState: false })
const [state2, searchParams2] = useMutableParams<Schema>({ syncState: true })

useEffect(() => {
  searchParams.set('q', 'foo', { syncState: true })
}, [searchParams])

useEffect(() => {
  console.log(state.q) // will log 'foo'
}, [state.q])

useEffect(() => {
  console.log(state2.q) // will also log 'foo'
}, [state2.q])
```

Arrays will be serilized by default, but if you want to store them in the way [.append()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/append) does, you can provide the `serializeArrays` option:
`useMutableParams<Schema>({ serializeArrays:  false })`
or
`searchParams.set('q', 'foo', { serializeArrays:  false })`

By default, `searchParams` updates URL via [`history.pushState()`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState). If you want [`history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) to be used instead, provide the `replace` option:
`useMutableParams<Schema>({ replace:  true })` 
or
`searchParams.set('q', 'foo', { replace:  true })`
### `searchParams.delete(key, value?, options?)`
Deletes key and serialized value if provided. Otherwise, everything works the same as in the `set()` method except that the serialiseArrays setting has no effect on it, and cannot be provided. When working with arrays `delete()` will initially assume that the array may or may not have been serialised

### `searchParams.get(key)`
[`URLSearchParams.get()`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/get) and [.getAll()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/getAll) methods combined. Returns the serialized value stored in the search parameters, or null if there is no value. Custom deserializer can be provided as hook option `useMutableParams<Schema>({ serializer })`. 

### `entries(), keys(), values(), forEach(), size, sort(), toString() and has()`
These methods work just like the ones provided by the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) interface, but with typings and data deserialisation if necessary.
