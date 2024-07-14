export type Schema = typeof schema
export type Keys = keyof Schema

export const schema = {
  string: 'test',
  number: 1,
  boolean: true,
  null: null,
  undefined: undefined,
  array: ['test', 1, true, null],
  multidimensionalArray: [
    ['test', 1, true, null],
    ['test', 1, true, null]
  ],
  object: {
    string: 'test',
    number: 1,
    boolean: true,
    null: null,
    array: [1, 2, 3],
    multidimensionalArray: [
      ['test', 1, true, null],
      ['test', 1, true, null]
    ],
    object: {
      string: 'test',
      number: 1,
      boolean: true,
      null: null,
      array: ['test', 1, true, null],
      multidimensionalArray: [
        ['test', 1, true, null],
        ['test', 1, true, null]
      ]
    }
  }
}

export const flatSchema = Object.entries(schema) as [Keys, Schema[Keys]][]
