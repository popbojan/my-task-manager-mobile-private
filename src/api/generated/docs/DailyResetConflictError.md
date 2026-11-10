
# DailyResetConflictError


## Properties

Name | Type
------------ | -------------
`code` | string
`statusCode` | number
`error` | string
`message` | string

## Example

```typescript
import type { DailyResetConflictError } from ''

// TODO: Update the object below with actual values
const example = {
  "code": null,
  "statusCode": null,
  "error": Conflict,
  "message": A new day has started and a daily reset is required. Reload current state and retry.
,
} satisfies DailyResetConflictError

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DailyResetConflictError
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


