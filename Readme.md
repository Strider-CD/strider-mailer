## Strider Mailer

This allows mail to be sent using the mail server configured within Strider.

### Usage

```js
const mailer = require('strider-mailer')(striderConfigObject);
mailer.send(to, subject, textBody, htmlBody);
```

### Methods

Other than the main send function, there are a couple of conveniance methods for formatting various output to be sent within the email

#### `elapsed_duration(startTimeInSeconds, endTimeInSeconds)`

Formats the test duration to a nice format e.g 1m 23s

#### `format_std(stdOutput, formatType)`

Formats the test output. FormatType can be of either 'html' or 'plaintext'
