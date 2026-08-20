
# Task


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`description` | string
`status` | [TaskStatus](TaskStatus.md)
`priority` | [TaskPriority](TaskPriority.md)
`deadline` | Date
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { Task } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": My urgent task,
  "description": Fix login bug when access token expires,
  "status": null,
  "priority": null,
  "deadline": 2026-05-10T00:00Z,
  "createdAt": null,
  "updatedAt": null,
} satisfies Task

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Task
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


