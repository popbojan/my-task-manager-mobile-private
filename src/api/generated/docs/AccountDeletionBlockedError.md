
# AccountDeletionBlockedError


## Properties

Name | Type
------------ | -------------
`code` | string
`statusCode` | number
`error` | string
`message` | string
`blockingSubscriptions` | [Array&lt;AccountDeletionBlockingSubscription&gt;](AccountDeletionBlockingSubscription.md)

## Example

```typescript
import type { AccountDeletionBlockedError } from ''

// TODO: Update the object below with actual values
const example = {
  "code": null,
  "statusCode": null,
  "error": Bad Request,
  "message": body/email must match format "email",
  "blockingSubscriptions": null,
} satisfies AccountDeletionBlockedError

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AccountDeletionBlockedError
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


