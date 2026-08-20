# DefaultApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createCheckoutSession**](DefaultApi.md#createcheckoutsession) | **POST** /subscriptions/checkout-session | Create a Stripe Checkout session |
| [**createCustomerPortalSession**](DefaultApi.md#createcustomerportalsession) | **POST** /subscriptions/customer-portal | Create a Stripe Customer Portal session |
| [**createRecurringTask**](DefaultApi.md#createrecurringtaskoperation) | **POST** /recurring-tasks | Create a new recurring task |
| [**createTask**](DefaultApi.md#createtaskoperation) | **POST** /tasks | Create a new task |
| [**deleteRecurringTask**](DefaultApi.md#deleterecurringtask) | **DELETE** /recurring-tasks/{recurringTaskId} | Delete a recurring task |
| [**deleteTask**](DefaultApi.md#deletetask) | **DELETE** /tasks/{taskId} | Delete a task |
| [**getCurrentUser**](DefaultApi.md#getcurrentuser) | **GET** /users/me | Get current user |
| [**getCurrentUserSubscription**](DefaultApi.md#getcurrentusersubscription) | **GET** /subscriptions/me | Get current user\&#39;s subscription |
| [**getMasteryLevels**](DefaultApi.md#getmasterylevels) | **GET** /mastery-levels | Get all mastery levels |
| [**getRecurringTask**](DefaultApi.md#getrecurringtask) | **GET** /recurring-tasks/{recurringTaskId} | Get a single recurring task |
| [**getRecurringTaskProgress**](DefaultApi.md#getrecurringtaskprogress) | **GET** /recurring-task-progress | Get recurring task progress for the authenticated user |
| [**getRecurringTasks**](DefaultApi.md#getrecurringtasks) | **GET** /recurring-tasks | Get recurring tasks for the authenticated user |
| [**getTask**](DefaultApi.md#gettask) | **GET** /tasks/{taskId} | Get a single task |
| [**getTasks**](DefaultApi.md#gettasks) | **GET** /tasks | Get tasks for the authenticated user |
| [**loginWithOtp**](DefaultApi.md#loginwithotp) | **POST** /auth/login-with-otp | Login using an email and the received OTP |
| [**logout**](DefaultApi.md#logout) | **POST** /auth/logout | Logout user and invalidate refresh token |
| [**refreshAccessToken**](DefaultApi.md#refreshaccesstoken) | **POST** /auth/refresh | Refresh access token using refresh token cookie |
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

Updates title, description or status of a recurring task.

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

