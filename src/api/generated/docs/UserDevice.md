
# UserDevice

Registered device for the user. Created or updated via auth device headers. Does not expose internal ids, timestamps, or verification state. 

## Properties

Name | Type
------------ | -------------
`deviceId` | string
`platform` | [DevicePlatform](DevicePlatform.md)
`appVersion` | string
`manufacturer` | string
`model` | string
`osName` | string
`osVersion` | string
`browserName` | string
`browserVersion` | string
`notificationsEnabled` | boolean
`notificationTime` | string

## Example

```typescript
import type { UserDevice } from ''

// TODO: Update the object below with actual values
const example = {
  "deviceId": 6f1d2c3a-8b4e-4f91-9c0a-1e2d3f4a5b6c,
  "platform": null,
  "appVersion": 1.4.0,
  "manufacturer": Apple,
  "model": iPhone 15,
  "osName": iOS,
  "osVersion": 17.4,
  "browserName": Chrome,
  "browserVersion": 131.0.6778.86,
  "notificationsEnabled": true,
  "notificationTime": 20:00,
} satisfies UserDevice

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserDevice
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


