# BIC: offline authentication

We provide functionality that will store a hash of a user's credentials locally
for future use when the device is offline.

See our [example of a message-interaction login prompt](../examples/loginprompt.html).

The BIC uses [our offline login library](https://github.com/blinkmobile/offlineLogin),
and implements the BIC-specific storage functionality on top.

## Prerequisites

- the answerSpace must already function offline
- the device must meet [our requirements for persistent storage](./persistent-storage.md)


## Client-side online detection

The Web Platform APIs provide a way to detect when a device is offline:
https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine

```javascript
if (navigator.onLine) {
  // the device has a network connection, and may or may not be online
} else {
  // the device is missing network connectivity
}
```

## Sequence

### Online

1. the user completes your login interaction and submits a login attempt

2. your code (server and client) processes the attempt

3. if the attempt succeeds, then use `BMP.Authentication.setCurrent()`

4. your code performs the post-sign-in behaviours as normal (e.g. navigation),
  depending on the success or failure of the attempt

### Offline

1. the user completes your login interaction and submits a login attempt

2. your code (client) uses `BMP.Authentication.authenticate()`

3. your code performs the post-sign-in behaviours as normal (e.g. navigation)
depending on the success or failure of the attempt
