
# DailyReviewReminderCommandOutboxItem

Outbox entry for a Today-page reminder (daily_review).

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
import type { DailyReviewReminderCommandOutboxItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": outbox-456,
  "userId": user-123,
  "deviceId": device-123,
  "reminderType": null,
  "taskId": null,
  "notificationId": daily-review-reminder,
  "revision": 1,
} satisfies DailyReviewReminderCommandOutboxItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DailyReviewReminderCommandOutboxItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


