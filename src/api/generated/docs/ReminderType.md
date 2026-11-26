
# ReminderType

Kind of reminder represented by an outbox entry. daily_review: Today-page reminder; taskId is null. recurring_task: per-task reminder; taskId is the task id. 

## Properties

Name | Type
------------ | -------------

## Example

```typescript
import type { ReminderType } from ''

// TODO: Update the object below with actual values
const example = {
} satisfies ReminderType

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReminderType
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


