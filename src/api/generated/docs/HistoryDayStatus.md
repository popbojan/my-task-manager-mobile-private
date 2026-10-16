
# HistoryDayStatus

in_progress: non-finalized day with outstanding tasks. success: at least one counted task and all completed. missed: finalized day with at least one outstanding task. no_tasks: known day with zero counted tasks. server_skipped: finalized day without a normal daily evaluation result. unknown: note exists but no recorded daily result; counts are null. Status is calculated by the backend using the same counted task set and success rules as global recurring-task progress. 

## Properties

Name | Type
------------ | -------------

## Example

```typescript
import type { HistoryDayStatus } from ''

// TODO: Update the object below with actual values
const example = {
} satisfies HistoryDayStatus

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as HistoryDayStatus
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


