
# ReminderCommandOutboxItem

Open reminder-command outbox entry for one user and device. reminderType and taskId are validated together via oneOf. 

## Properties

Name | Type
------------ | -------------
`id` | string
`userId` | string
`deviceId` | string
`reminderType` | string
`taskId` | string
`notificationId` | string
`revision` | number

## Example

```typescript
import type { ReminderCommandOutboxItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": outbox-123,
  "userId": user-123,
  "deviceId": device-123,
  "reminderType": null,
  "taskId": task-123,
  "notificationId": recurring-reminder-task-123,
  "revision": 1,
} satisfies ReminderCommandOutboxItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReminderCommandOutboxItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


