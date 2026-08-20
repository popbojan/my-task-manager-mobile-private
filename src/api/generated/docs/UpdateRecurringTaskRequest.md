
# UpdateRecurringTaskRequest


## Properties

Name | Type
------------ | -------------
`title` | string
`description` | string
`status` | [RecurringTaskStatus](RecurringTaskStatus.md)

## Example

```typescript
import type { UpdateRecurringTaskRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "title": Learning German,
  "description": null,
  "status": null,
} satisfies UpdateRecurringTaskRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateRecurringTaskRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


