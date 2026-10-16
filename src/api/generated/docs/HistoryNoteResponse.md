
# HistoryNoteResponse


## Properties

Name | Type
------------ | -------------
`date` | Date
`note` | string

## Example

```typescript
import type { HistoryNoteResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "date": Sat Oct 10 02:00:00 CEST 2026,
  "note": Heute war ich unterwegs.,
} satisfies HistoryNoteResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as HistoryNoteResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


