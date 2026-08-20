
# MasteryLevel


## Properties

Name | Type
------------ | -------------
`id` | string
`number` | number
`nameEn` | string
`nameDe` | string
`nameFr` | string
`nameSr` | string
`avatarKey` | string
`avatarRevealed` | boolean
`requiredStreak` | number
`maxAllowedTasks` | number
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { MasteryLevel } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "number": 4,
  "nameEn": Disciplined Fighter,
  "nameDe": Disziplinierter Kämpfer,
  "nameFr": Combattant discipliné,
  "nameSr": Disciplinovani borac,
  "avatarKey": level-04-disciplined-fighter,
  "avatarRevealed": false,
  "requiredStreak": 90,
  "maxAllowedTasks": 4,
  "createdAt": null,
  "updatedAt": null,
} satisfies MasteryLevel

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MasteryLevel
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


