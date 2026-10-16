
# HistoryResponse


## Properties

Name | Type
------------ | -------------
`month` | string
`today` | Date
`timezone` | string
`days` | [Array&lt;HistoryDay&gt;](HistoryDay.md)

## Example

```typescript
import type { HistoryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "month": 2026-10,
  "today": Sun Oct 11 02:00:00 CEST 2026,
  "timezone": Europe/Berlin,
  "days": null,
} satisfies HistoryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as HistoryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


