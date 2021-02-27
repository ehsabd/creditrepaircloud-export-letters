## Build and Load Chrome Extension

Use `npm run build` to build the extension. Then load unpacked extension from `dist` folder.

## Configuring the Endpoint

You can configure the **Export Endpoint URL** in the extension popup panel.

### Sent Data
The extension sends a request for each selected letter in the batch pring page to the endpoint. The data is sent using JSON with the following format:

```json
{
   "from":{
      "address_country":"US",
      "name":"John Doe",
      "address_city":"City",
      "address_state":"State ",
      "address_zip":"12345",
      "address_line1":"address line1",
      "address_line2":"address line2"  
   },
   "to":{
      "address_country":"US",
      "name":"John Doe",
      "address_city":"City",
      "address_state":"State ",
      "address_zip":"12345",
      "address_line1":"address line1",
      "address_line2":"address line2"
   },
   "ssn":"1234",
   "crc_letter_id":"123",
   "crc_username":"user@email.com"
}
```
### Expected Response from the Endpoint

If the endpoint sends an HTTP response with an error status code (e.g., 400) or a JSON valid response that includes `error` key, the endpoint response will be shown to the user as an error message. Otherwise, the extension considers a successful operation on the endpoint and shows progress to the user. In any occurances, the endpoint response body will be logged into the console.

## Testing

### Testing The Extension PopUp
#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### Testing The Extension Content Scripts
#### `jasmine`
