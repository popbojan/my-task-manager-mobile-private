
# Subscription


## Properties

Name | Type
------------ | -------------
`id` | string
`provider` | [SubscriptionProvider](SubscriptionProvider.md)
`type` | [SubscriptionType](SubscriptionType.md)
`status` | [SubscriptionStatus](SubscriptionStatus.md)
`productId` | string
`currentPeriodStart` | Date
`currentPeriodEnd` | Date
`cancelAtPeriodEnd` | boolean
`startedAt` | Date
`canceledAt` | Date
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { Subscription } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "provider": null,
  "type": null,
  "status": null,
  "productId": premium-yearly,
  "currentPeriodStart": null,
  "currentPeriodEnd": null,
  "cancelAtPeriodEnd": false,
  "startedAt": null,
  "canceledAt": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies Subscription

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Subscription
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


