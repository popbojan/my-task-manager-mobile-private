
# DevicePlatformMismatchError


## Properties

Name | Type
------------ | -------------
`code` | string
`statusCode` | number
`error` | string
`message` | string

## Example

```typescript
import type { DevicePlatformMismatchError } from ''

// TODO: Update the object below with actual values
const example = {
  "code": null,
  "statusCode": null,
  "error": Conflict,
  "message": Device platform does not match the stored device. Generate a new installation id and retry once.
,
} satisfies DevicePlatformMismatchError

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DevicePlatformMismatchError
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


