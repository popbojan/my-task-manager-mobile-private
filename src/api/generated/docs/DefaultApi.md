# DefaultApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createCheckoutSession**](DefaultApi.md#createcheckoutsession) | **POST** /subscriptions/checkout-session | Create a Stripe Checkout session |
| [**createCustomerPortalSession**](DefaultApi.md#createcustomerportalsession) | **POST** /subscriptions/customer-portal | Create a Stripe Customer Portal session |
| [**createRecurringTask**](DefaultApi.md#createrecurringtaskoperation) | **POST** /recurring-tasks | Create a new recurring task |
| [**createTask**](DefaultApi.md#createtaskoperation) | **POST** /tasks | Create a new task |
| [**deleteCurrentUser**](DefaultApi.md#deletecurrentuser) | **DELETE** /users/me | Permanently delete the current user\&#39;s account |
| [**deleteHistoryNote**](DefaultApi.md#deletehistorynote) | **DELETE** /history/{date}/note | Delete a daily history note |
| [**deleteRecurringTask**](DefaultApi.md#deleterecurringtask) | **DELETE** /recurring-tasks/{recurringTaskId} | Delete a recurring task |
| [**deleteTask**](DefaultApi.md#deletetask) | **DELETE** /tasks/{taskId} | Delete a task |
| [**getCurrentUser**](DefaultApi.md#getcurrentuser) | **GET** /users/me | Get current user |
| [**getCurrentUserSubscription**](DefaultApi.md#getcurrentusersubscription) | **GET** /subscriptions/me | Get current user\&#39;s subscription |
| [**getHistory**](DefaultApi.md#gethistory) | **GET** /history | Get monthly daily history for the authenticated user |
| [**getMasteryLevels**](DefaultApi.md#getmasterylevels) | **GET** /mastery-levels | Get all mastery levels |
| [**getRecurringTask**](DefaultApi.md#getrecurringtask) | **GET** /recurring-tasks/{recurringTaskId} | Get a single recurring task |
| [**getRecurringTaskProgress**](DefaultApi.md#getrecurringtaskprogress) | **GET** /recurring-task-progress | Get recurring task progress for the authenticated user |
| [**getRecurringTasks**](DefaultApi.md#getrecurringtasks) | **GET** /recurring-tasks | Get recurring tasks for the authenticated user |
| [**getTask**](DefaultApi.md#gettask) | **GET** /tasks/{taskId} | Get a single task |
| [**getTasks**](DefaultApi.md#gettasks) | **GET** /tasks | Get tasks for the authenticated user |
| [**loginWithOtp**](DefaultApi.md#loginwithotp) | **POST** /auth/login-with-otp | Login using an email and the received OTP |
| [**logout**](DefaultApi.md#logout) | **POST** /auth/logout | Logout user and invalidate refresh token |
| [**putHistoryNote**](DefaultApi.md#puthistorynoteoperation) | **PUT** /history/{date}/note | Create or replace a daily history note |
| [**refreshAccessToken**](DefaultApi.md#refreshaccesstoken) | **POST** /auth/refresh | Refresh access token using refresh token cookie |
| [**repairHistoryDay**](DefaultApi.md#repairhistoryday) | **POST** /history/yesterday/repair | Repair yesterday\&#39;s finalized missed history day |
| [**requestOtp**](DefaultApi.md#requestotp) | **POST** /auth/request-otp | Request a one-time password via email |
| [**updateRecurringTask**](DefaultApi.md#updaterecurringtaskoperation) | **PATCH** /recurring-tasks/{recurringTaskId} | Update a recurring task |
| [**updateTask**](DefaultApi.md#updatetaskoperation) | **PATCH** /tasks/{taskId} | Update a task |
| [**updateUserPreferences**](DefaultApi.md#updateuserpreferencesoperation) | **PATCH** /users/me/preferences | Update current user\&#39;s preferences |



## createCheckoutSession

> CheckoutSession createCheckoutSession()

Create a Stripe Checkout session

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateCheckoutSessionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.createCheckoutSession();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**CheckoutSession**](CheckoutSession.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Checkout session created successfully. |  -  |
| **401** | Authentication required. |  -  |
| **500** | Internal server error. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createCustomerPortalSession

> CustomerPortalSession createCustomerPortalSession()

Create a Stripe Customer Portal session

Creates a Stripe Customer Portal session for the authenticated user. The portal allows the user to manage or cancel their subscription, update their payment method, and view invoices. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateCustomerPortalSessionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.createCustomerPortalSession();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**CustomerPortalSession**](CustomerPortalSession.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Customer Portal session created successfully |  -  |
| **400** | No Stripe customer exists for the authenticated user |  -  |
| **401** | Authentication required |  -  |
| **500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createRecurringTask

> RecurringTask createRecurringTask(createRecurringTaskRequest)

Create a new recurring task

Creates a new daily recurring task.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateRecurringTaskOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // CreateRecurringTaskRequest
    createRecurringTaskRequest: ...,
  } satisfies CreateRecurringTaskOperationRequest;

  try {
    const data = await api.createRecurringTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createRecurringTaskRequest** | [CreateRecurringTaskRequest](CreateRecurringTaskRequest.md) |  | |

### Return type

[**RecurringTask**](RecurringTask.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Recurring task created |  -  |
| **400** | Invalid request |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createTask

> Task createTask(createTaskRequest)

Create a new task

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateTaskOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // CreateTaskRequest
    createTaskRequest: ...,
  } satisfies CreateTaskOperationRequest;

  try {
    const data = await api.createTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createTaskRequest** | [CreateTaskRequest](CreateTaskRequest.md) |  | |

### Return type

[**Task**](Task.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Task created |  -  |
| **400** | Invalid request |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteCurrentUser

> deleteCurrentUser()

Permanently delete the current user\&#39;s account

Deletes the authenticated user\&#39;s account and associated application data. Requires explicit user confirmation in the client and recent OTP authentication. Checks all subscription providers against fresh provider data before deletion. Running subscriptions must first be canceled; subscriptions already set to cancel at period end do not block deletion. Does not cancel store subscriptions, refund purchases, or delete the user\&#39;s Google, Apple, or Stripe account. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteCurrentUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.deleteCurrentUser();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Application account and data deleted; all sessions revoked. Any required provider cleanup is durably queued and completed with retries.  |  * Set-Cookie - Clears the refresh token cookie using its original path and domain. <br>  |
| **401** | Missing or invalid authentication, including a previously deleted account. |  -  |
| **403** | Recent OTP authentication required; code REAUTHENTICATION_REQUIRED. |  -  |
| **409** | A running subscription must first be canceled. |  -  |
| **503** | Subscription status could not be verified; code SUBSCRIPTION_VERIFICATION_UNAVAILABLE. No account data is deleted.  |  -  |
| **500** | Internal error; database deletion is rolled back. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteHistoryNote

> deleteHistoryNote(date)

Delete a daily history note

Deletes only the authenticated user\&#39;s note for this date, preserving any daily result. Returns 204 even when no note exists. After deletion, a date without a recorded result is omitted from GET /history. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteHistoryNoteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // Date | Valid calendar date in YYYY-MM-DD format.           Past, present, and future dates are allowed,           including dates before account creation. 
    date: 2026-10-10,
  } satisfies DeleteHistoryNoteRequest;

  try {
    const data = await api.deleteHistoryNote(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **date** | `Date` | Valid calendar date in YYYY-MM-DD format.           Past, present, and future dates are allowed,           including dates before account creation.  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Note removed or already absent. |  -  |
| **400** | Invalid input. |  -  |
| **401** | Missing or invalid bearer authentication. |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteRecurringTask

> deleteRecurringTask(recurringTaskId)

Delete a recurring task

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteRecurringTaskRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    recurringTaskId: recurringTaskId_example,
  } satisfies DeleteRecurringTaskRequest;

  try {
    const data = await api.deleteRecurringTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **recurringTaskId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Recurring task deleted |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteTask

> deleteTask(taskId)

Delete a task

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteTaskRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    taskId: taskId_example,
  } satisfies DeleteTaskRequest;

  try {
    const data = await api.deleteTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **taskId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Task deleted |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCurrentUser

> User getCurrentUser()

Get current user

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetCurrentUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.getCurrentUser();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**User**](User.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Current authenticated user |  -  |
| **401** | Unauthorized |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCurrentUserSubscription

> SubscriptionAccess getCurrentUserSubscription()

Get current user\&#39;s subscription

Returns the authenticated user\&#39;s current premium access and subscription details, if available. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetCurrentUserSubscriptionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.getCurrentUserSubscription();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**SubscriptionAccess**](SubscriptionAccess.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Current subscription |  -  |
| **401** | Unauthorized |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getHistory

> HistoryResponse getHistory(month)

Get monthly daily history for the authenticated user

Returns the authenticated user\&#39;s recurring-task history and notes for the requested month. Ordinary board tasks are excluded. Entries are ordered by date ascending and unique per user and date. Every completed day with recurring tasks must have a recorded result, even if the user did not open the app. If at least one counted task was not completed by the daily cutoff, the day is marked as missed, including days with zero completed tasks. Dates before history tracking began may have no recorded data. Future dates are included when a note exists. Note-only entries have status unknown and null task counts. Current-day results are provisional and may change until finalized. Success is visible immediately when all counted tasks are completed. Finalized results remain unchanged; notes remain editable. Each finalized day stores a snapshot of the global recurring-task currentStreak and currentLevel after that day\&#39;s evaluation. Historical dates retain their original local date after timezone changes. Finalized missed days with counted tasks may be repaired only for the previous calendar day in the user\&#39;s timezone via POST /history/yesterday/repair. No subscription requirement is added by this contract. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetHistoryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string | Calendar month in YYYY-MM format; year 0001 through 9999. Invalid months are rejected. 
    month: 2026-10,
  } satisfies GetHistoryRequest;

  try {
    const data = await api.getHistory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **month** | `string` | Calendar month in YYYY-MM format; year 0001 through 9999. Invalid months are rejected.  | [Defaults to `undefined`] |

### Return type

[**HistoryResponse**](HistoryResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Monthly history; days may be empty. |  -  |
| **400** | Invalid input. |  -  |
| **401** | Missing or invalid bearer authentication. |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMasteryLevels

> Array&lt;MasteryLevel&gt; getMasteryLevels()

Get all mastery levels

Returns the complete ordered list of 24 mastery levels. This endpoint is public so the levels can be displayed before login.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetMasteryLevelsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.getMasteryLevels();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;MasteryLevel&gt;**](MasteryLevel.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Ordered list of mastery levels |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRecurringTask

> RecurringTask getRecurringTask(recurringTaskId)

Get a single recurring task

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetRecurringTaskRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    recurringTaskId: recurringTaskId_example,
  } satisfies GetRecurringTaskRequest;

  try {
    const data = await api.getRecurringTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **recurringTaskId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**RecurringTask**](RecurringTask.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Recurring task found |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Recurring task not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRecurringTaskProgress

> RecurringTaskProgress getRecurringTaskProgress()

Get recurring task progress for the authenticated user

Returns the user\&#39;s global recurring-task streak, current mastery level, and highest achievements reached.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetRecurringTaskProgressRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.getRecurringTaskProgress();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**RecurringTaskProgress**](RecurringTaskProgress.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Recurring task progress |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getRecurringTasks

> Array&lt;RecurringTask&gt; getRecurringTasks()

Get recurring tasks for the authenticated user

Returns all recurring tasks owned by the authenticated user.

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetRecurringTasksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.getRecurringTasks();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;RecurringTask&gt;**](RecurringTask.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of recurring tasks |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTask

> Task getTask(taskId)

Get a single task

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetTaskRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    taskId: taskId_example,
  } satisfies GetTaskRequest;

  try {
    const data = await api.getTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **taskId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Task**](Task.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Task found |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Task not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTasks

> Array&lt;Task&gt; getTasks()

Get tasks for the authenticated user

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetTasksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.getTasks();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;Task&gt;**](Task.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of tasks |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## loginWithOtp

> LoginResponse loginWithOtp(loginRequest)

Login using an email and the received OTP

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { LoginWithOtpRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // LoginRequest
    loginRequest: ...,
  } satisfies LoginWithOtpRequest;

  try {
    const data = await api.loginWithOtp(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **loginRequest** | [LoginRequest](LoginRequest.md) |  | |

### Return type

[**LoginResponse**](LoginResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OTP verified and access token generated. A refresh token cookie is set. |  * Set-Cookie - HttpOnly refresh token cookie (refreshToken&#x3D;...; HttpOnly; Secure; SameSite&#x3D;...) <br>  |
| **401** | Invalid or expired OTP |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## logout

> logout()

Logout user and invalidate refresh token

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { LogoutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.logout();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Successfully logged out. Refresh token cookie is cleared. |  * Set-Cookie - Clears the refresh token cookie (refreshToken&#x3D;; Max-Age&#x3D;0; ...) <br>  |
| **401** | No valid refresh token provided |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## putHistoryNote

> HistoryNoteResponse putHistoryNote(date, putHistoryNoteRequest)

Create or replace a daily history note

Stores one note per authenticated user and date. Trim leading and trailing whitespace before storage. Reject blank text and text longer than 2000 Unicode code points before trimming. Preserve internal whitespace and line breaks. Repeating the same request has the same effect. Last committed write wins. Notes are allowed without a recorded daily result and must not create success, missed, or task counts. Task results cannot be modified through this endpoint. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { PutHistoryNoteOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // Date | Valid calendar date in YYYY-MM-DD format.           Past, present, and future dates are allowed,           including dates before account creation. 
    date: 2026-10-10,
    // PutHistoryNoteRequest
    putHistoryNoteRequest: ...,
  } satisfies PutHistoryNoteOperationRequest;

  try {
    const data = await api.putHistoryNote(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **date** | `Date` | Valid calendar date in YYYY-MM-DD format.           Past, present, and future dates are allowed,           including dates before account creation.  | [Defaults to `undefined`] |
| **putHistoryNoteRequest** | [PutHistoryNoteRequest](PutHistoryNoteRequest.md) |  | |

### Return type

[**HistoryNoteResponse**](HistoryNoteResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Note created or replaced; returns normalized stored text. |  -  |
| **400** | Invalid input. |  -  |
| **401** | Missing or invalid bearer authentication. |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## refreshAccessToken

> LoginResponse refreshAccessToken()

Refresh access token using refresh token cookie

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { RefreshAccessTokenRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.refreshAccessToken();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**LoginResponse**](LoginResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | New access token issued. Refresh token cookie may be rotated. |  * Set-Cookie - HttpOnly refresh token cookie (refreshToken&#x3D;...; HttpOnly; Secure; SameSite&#x3D;...) <br>  |
| **401** | Missing, invalid, or expired refresh token |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## repairHistoryDay

> HistoryDay repairHistoryDay()

Repair yesterday\&#39;s finalized missed history day

Repairs the calendar day immediately before today in the user\&#39;s IANA timezone (same notion of today as GET /history). The client does not send a date; the backend selects that previous day. For example, when today is 2026-10-23, this operation applies to 2026-10-22 only. Retroactively treats that day as successful when the user forgot to mark all counted recurring tasks done before the daily cutoff (e.g. 6/7 and status missed). Sets success with completedTasks equal to totalTasks, records repairedAt, and recomputes global recurring-task progress and affected history streak snapshots from that date forward. Does not change today\&#39;s live recurring-task board statuses. Idempotent when that day is already success. Only applies when that day is finalized with status missed and totalTasks &gt; 0. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { RepairHistoryDayRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.repairHistoryDay();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**HistoryDay**](HistoryDay.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Yesterday repaired (or already success); returns the updated history day. Global progress is recomputed server-side; clients load it via GET /recurring-task-progress (e.g. on the Heute screen).  |  -  |
| **401** | Missing or invalid bearer authentication. |  -  |
| **409** | Yesterday cannot be repaired; code HISTORY_DAY_NOT_REPAIRABLE (e.g. not missed, not finalized, no counted tasks, no recorded yesterday, or before history tracking).  |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## requestOtp

> RequestOtp200Response requestOtp(oTPRequest)

Request a one-time password via email

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { RequestOtpRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // OTPRequest
    oTPRequest: ...,
  } satisfies RequestOtpRequest;

  try {
    const data = await api.requestOtp(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **oTPRequest** | [OTPRequest](OTPRequest.md) |  | |

### Return type

[**RequestOtp200Response**](RequestOtp200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OTP successfully sent |  -  |
| **400** | Bad Request (e.g. invalid email format) |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateRecurringTask

> RecurringTask updateRecurringTask(recurringTaskId, updateRecurringTaskRequest)

Update a recurring task

Updates title, description, status, or notification settings of a recurring task. 

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { UpdateRecurringTaskOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    recurringTaskId: recurringTaskId_example,
    // UpdateRecurringTaskRequest
    updateRecurringTaskRequest: ...,
  } satisfies UpdateRecurringTaskOperationRequest;

  try {
    const data = await api.updateRecurringTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **recurringTaskId** | `string` |  | [Defaults to `undefined`] |
| **updateRecurringTaskRequest** | [UpdateRecurringTaskRequest](UpdateRecurringTaskRequest.md) |  | |

### Return type

[**RecurringTask**](RecurringTask.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Recurring task updated |  -  |
| **400** | Invalid request |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Recurring task not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateTask

> Task updateTask(taskId, updateTaskRequest)

Update a task

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { UpdateTaskOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    taskId: taskId_example,
    // UpdateTaskRequest
    updateTaskRequest: ...,
  } satisfies UpdateTaskOperationRequest;

  try {
    const data = await api.updateTask(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **taskId** | `string` |  | [Defaults to `undefined`] |
| **updateTaskRequest** | [UpdateTaskRequest](UpdateTaskRequest.md) |  | |

### Return type

[**Task**](Task.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Task updated |  -  |
| **400** | Invalid request |  -  |
| **401** | Unauthorized |  -  |
| **403** | Forbidden |  -  |
| **404** | Task not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateUserPreferences

> UserPreferencesResponse updateUserPreferences(updateUserPreferencesRequest)

Update current user\&#39;s preferences

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { UpdateUserPreferencesOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // UpdateUserPreferencesRequest
    updateUserPreferencesRequest: ...,
  } satisfies UpdateUserPreferencesOperationRequest;

  try {
    const data = await api.updateUserPreferences(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **updateUserPreferencesRequest** | [UpdateUserPreferencesRequest](UpdateUserPreferencesRequest.md) |  | |

### Return type

[**UserPreferencesResponse**](UserPreferencesResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User preferences successfully updated |  -  |
| **400** | Bad Request (e.g. invalid language or timezone) |  -  |
| **401** | Unauthorized |  -  |
| **500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

