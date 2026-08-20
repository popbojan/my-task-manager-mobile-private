
# RecurringTask


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`description` | string
`status` | [RecurringTaskStatus](RecurringTaskStatus.md)
`streakCount` | number
`lastCompletedAt` | Date
`lastResetAt` | Date
`nextResetAt` | Date
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { RecurringTask } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": Learning German,
  "description": Reading or writing for 30 minutes,
  "status": null,
  "streakCount": 7,
  "lastCompletedAt": 2026-06-06T18:30Z,
  "lastResetAt": 2026-06-06T22:08Z,
  "nextResetAt": 2026-06-07T22:05Z,
  "createdAt": null,
  "updatedAt": null,
} satisfies RecurringTask

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecurringTask
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


