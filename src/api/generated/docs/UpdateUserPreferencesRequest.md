
# UpdateUserPreferencesRequest

Required non-empty JSON object with at least one supported preference field (anyOf). Unknown properties are rejected. Clients that previously sent webLastLoginAt must stop; login time is set only on successful OTP login. Call when language, timezone, or app version changed, or when the user explicitly changes preferences (including notifications). Unchanged values may be included; regular start/foreground sync is not required. New clients report device version via X-App-Version; body mobileAppVersion remains for older clients and updates only User.mobileAppVersion. 

## Properties

Name | Type
------------ | -------------
`language` | [Language](Language.md)
`timezone` | string
`notificationEnabled` | boolean
`notificationTime` | string
`personalIntroSeenAt` | Date
`mobileOnboardingSeenAt` | Date
`webOnboardingSeenAt` | Date
`mobileAppVersion` | string
`personalFocusTaskName` | string
`personalFocusMotivation` | string
`webLastSeenAt` | Date

## Example

```typescript
import type { UpdateUserPreferencesRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "language": null,
  "timezone": Europe/Berlin,
  "notificationEnabled": null,
  "notificationTime": 14:45,
  "personalIntroSeenAt": null,
  "mobileOnboardingSeenAt": null,
  "webOnboardingSeenAt": null,
  "mobileAppVersion": null,
  "personalFocusTaskName": null,
  "personalFocusMotivation": null,
  "webLastSeenAt": null,
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


