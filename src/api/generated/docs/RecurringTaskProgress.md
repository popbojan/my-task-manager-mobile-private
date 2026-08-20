
# RecurringTaskProgress


## Properties

Name | Type
------------ | -------------
`id` | string
`currentStreak` | number
`highestStreakReached` | number
`currentLevel` | number
`highestLevelReached` | number
`lastSuccessfulDay` | Date
`lastCheckedAt` | Date
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { RecurringTaskProgress } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "currentStreak": 37,
  "highestStreakReached": 94,
  "currentLevel": 2,
  "highestLevelReached": 4,
  "lastSuccessfulDay": 2026-07-14T00:00Z,
  "lastCheckedAt": 2026-07-15T00:00Z,
  "createdAt": null,
  "updatedAt": null,
} satisfies RecurringTaskProgress

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecurringTaskProgress
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


