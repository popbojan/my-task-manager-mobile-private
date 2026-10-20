
# User


## Properties

Name | Type
------------ | -------------
`id` | string
`email` | string
`language` | [Language](Language.md)
`timezone` | string
`personalIntroSeenAt` | Date
`mobileOnboardingSeenAt` | Date
`webOnboardingSeenAt` | Date
`personalFocusTaskName` | string
`personalFocusMotivation` | string

## Example

```typescript
import type { User } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "email": null,
  "language": null,
  "timezone": Europe/Berlin,
  "personalIntroSeenAt": 2026-10-19T08:30Z,
  "mobileOnboardingSeenAt": null,
  "webOnboardingSeenAt": 2026-10-19T09:15Z,
  "personalFocusTaskName": 30 Minuten Deutsch lernen,
  "personalFocusMotivation": Ich möchte fließend sprechen können.,
} satisfies User

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as User
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


