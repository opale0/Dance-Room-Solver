# Request

A much nicer alternative to XMLHttpRequest, inspired from the javascript request-promise library. This library uses the Promise implementation available in the ES6Polyfills module for a nice, simple http interface.

## API

A simple GET request

```js
request('https://google.com')
    .then(function(response) {
        // Will print raw HTML
        print(response);
    })
    .catch(function(error) {
        // If anything goes wrong
        print(error);
    });
```

A GET request to a REST API

```js
request({
    url: 'https://jsonplaceholder.typicode.com/comments?postId=1',
    json: true
})
    .then(function(response) {
        // If the website does not return valid JSON data, 
        // then the parsing will fail and the catch block
        // will run
        print(JSON.stringify(response))
    });
```

Analyzing the response object

```js
request({
    url: 'https://jsonplaceholder.typicode.com/comments?postId=1',
    resolveWithFullResponse: true
})
    .then(function(response) {
        print(JSON.stringify(response, null, 2));
        /* {
             statusCode: 200,
             statusMessage: 'OK',
             headers: {
                 ...
             },
             body: "..."
           } */
    });
```

All options

```js
request({
    url: '...',
    method: 'POST',        // defaults to 'GET'
    qs: {                  // escaped and appended to url
        urlQsParam: 'value'
    },
    headers: {
        'User-Agent': 'Mozilla/5.0'
    },
    body: {                // Represents JSON POST data. Automatically
        jsonKey: 'value'   // sets 'Content-Type' header to 
    },                     // 'application/json; charset=UTF-8'
                           // Body takes presedence over 'form'

    form: {                // Represents form data. Automatically
        formKey: 'value'   // sets 'Content-Type' header to 
    },                     // 'x-www-form-urlencoded'
    followRedirect: false, // default to true
    connectTimeout: 1000,  // in ms, defaults to infinity
    readTimeout: 1000      // in ms, defaults to infinity
})
```