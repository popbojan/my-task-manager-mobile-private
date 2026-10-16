
# HistoryDay

Known counts satisfy 0 <= completedTasks <= totalTasks. success requires completedTasks = totalTasks > 0. missed and in_progress require completedTasks < totalTasks. in_progress requires finalizedAt null. no_tasks requires both counts zero. unknown requires both counts null and finalizedAt null. missed requires a non-null finalizedAt. currentStreak is the global recurring-task streak after this calendar day was processed; null for unknown and server_skipped days. currentLevel is the global mastery level derived from that streak after this calendar day was processed; null for unknown and server_skipped days. Finalized success, missed, and no_tasks days store non-null snapshots. in_progress may expose live streak and level until finalization. Finalization follows existing recurring-task day/reset rules, currently reset scheduled at 00:05 local time. Calendar history must not introduce a different streak cutoff. 

## Properties

Name | Type
------------ | -------------
`date` | Date
`status` | [HistoryDayStatus](HistoryDayStatus.md)
`completedTasks` | number
`totalTasks` | number
`note` | string
`finalizedAt` | Date
`currentStreak` | number
`currentLevel` | number

## Example

```typescript
import type { HistoryDay } from ''

// TODO: Update the object below with actual values
const example = {
  "date": Sat Oct 10 02:00:00 CEST 2026,
  "status": null,
  "completedTasks": 3,
  "totalTasks": 7,
  "note": Heute war ich unterwegs.,
  "finalizedAt": 2026-10-10T22:05Z,
  "currentStreak": 12,
  "currentLevel": 2,
} satisfies HistoryDay

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as HistoryDay
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


