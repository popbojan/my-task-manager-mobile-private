
# UpdateUserPreferencesRequest

Provide at least one of language, timezone, personalIntroSeenAt, mobileOnboardingSeenAt, webOnboardingSeenAt, or mobileAppVersion. 

## Properties

Name | Type
------------ | -------------
`language` | [Language](Language.md)
`timezone` | string
`personalIntroSeenAt` | Date
`mobileOnboardingSeenAt` | Date
`webOnboardingSeenAt` | Date
`mobileAppVersion` | string

## Example

```typescript
import type { UpdateUserPreferencesRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "language": null,
  "timezone": Europe/Berlin,
  "personalIntroSeenAt": null,
  "mobileOnboardingSeenAt": null,
  "webOnboardingSeenAt": null,
  "mobileAppVersion": null,
} satisfies UpdateUserPreferencesRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateUserPreferencesRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


