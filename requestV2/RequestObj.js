import socketFactory from './letsEncryptCerts';

const JURL = Java.type('java.net.URL');
const JDataOutputStream = Java.type('java.io.DataOutputStream');
const JURLEncoder = Java.type('java.net.URLEncoder');
const JBufferedReader = Java.type('java.io.BufferedReader');
const JInputStreamReader = Java.type('java.io.InputStreamReader');
const JString = Java.type('java.lang.String');
const JOutputStreamWriter = Java.type('java.io.OutputStreamWriter');
const JGZIPInputStream = Java.type('java.util.zip.GZIPInputStream');
const JHttpsUrlConnection = Java.type('javax.net.ssl.HttpsURLConnection');
const JBufferedOutputStream = Java.type('java.io.BufferedOutputStream');
const JFile = Java.type('java.io.File');
const JFiles = Java.type('java.nio.file.Files');
const JByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream");
const JURLConnection = Java.type("java.net.URLConnection")

function RequestObj(options, resolve, reject) {

  function getQueryString(obj) {
    let queryString = '';

    Object.keys(obj).forEach(qs => {
      queryString += `${JURLEncoder.encode(qs, 'UTF-8')}=${JURLEncoder.encode(obj[qs], 'UTF-8')}&`;
    });

    return queryString.length > 0 ? queryString.substr(0, queryString.length - 1) : queryString;
  }

  function createMultipartBody(parts, boundary) {
    let byteArrayOutputStream = new JByteArrayOutputStream();
    let dataOutputStream = new JDataOutputStream(byteArrayOutputStream);

    Object.keys(parts).forEach(key => {
      const part = parts[key];

      dataOutputStream.writeBytes(`--${boundary}\r\n`);
      if (part.file) {
        // This is a file part
        const file = new JFile(part.file)
        const file_name = file.getName();
        const byteArray = JFiles.readAllBytes(file.toPath());
        const mime_type = JURLConnection.guessContentTypeFromName(part.file);

        dataOutputStream.writeBytes(`Content-Disposition: form-data; name="${key}"; filename="${file_name}"\r\n`);
        dataOutputStream.writeBytes(`Content-Type: ${mime_type}\r\n\r\n`);
        dataOutputStream.write(byteArray);
        dataOutputStream.writeBytes(`\r\n`);
      } else {
        // This is a field part
        dataOutputStream.writeBytes(`Content-Disposition: form-data; name="${key}"\r\n\r\n`);
        dataOutputStream.writeBytes(part + "\r\n");
      }
    });

    dataOutputStream.writeBytes(`--${boundary}--\r\n`);
    dataOutputStream.close();

    return byteArrayOutputStream.toByteArray();;
  }

  new Thread(() => {
    try {
      // Query strings
      const queryString = '?' + getQueryString(options.qs);

      if (queryString.length > 1)
        options.url += queryString;

      const url = new JURL(options.url)
      const conn = url.openConnection();
      if (conn instanceof JHttpsUrlConnection) {
        conn.setSSLSocketFactory(socketFactory);
      }
      conn.setRequestMethod(options.method);
      conn.setDoOutput(true);
      conn.setConnectTimeout(options.connectTimeout);
      conn.setReadTimeout(options.readTimeout);
      conn.setInstanceFollowRedirects(options.followRedirect);
      conn.setRequestProperty('Accept-Encoding', 'gzip');

      // Headers
      Object.keys(options.headers).forEach(header => conn.setRequestProperty(header, options.headers[header]));

      if (options.method === 'POST') {
        if (typeof options.body === 'object') {
          conn.setRequestProperty('Content-Type', 'application/json; charset=UTF-8');
          let wr;

          try {
            wr = new JOutputStreamWriter(conn.getOutputStream());
            wr.write(JSON.stringify(options.body));
            wr.close();
          } catch (e) {
            print(e);
          } finally {
            wr.close();
          }
        } else if (typeof options.form === 'object') {
          // Interpret as query params
          const params = getQueryString(options.form);
          const bytes = new JString(params).getBytes('UTF-8');
          conn.setRequestProperty('Content-Type', 'application/x-www-form-urlencoded');
          conn.setRequestProperty('Content-Length', bytes.length.toString());
          let wr;

          try {
            wr = new JDataOutputStream(conn.getOutputStream());
            wr.write(bytes)
          } catch (e) {
            print(e);
          } finally {
            wr.close();
          }
        } else if (typeof options.multipart === "object") {
          const boundary = Math.random().toString(36).substring(2);
          conn.setRequestProperty('Content-Type', 'multipart/form-data; boundary=' + boundary);

          const multipartBody = createMultipartBody(options.multipart, boundary);
          conn.setRequestProperty('Content-Length', multipartBody.length);

          let wr;

          try {
            wr = new JBufferedOutputStream(conn.getOutputStream());
            wr.write(multipartBody)
          } catch (e) {
            print(e);
          } finally {
            wr.close();
          }
        }
      }

      // Get output
      const status = conn.getResponseCode();
      let stream;
      if (status > 299) {
        stream = conn.getErrorStream();
      } else {
        stream = conn.getInputStream();
      }

      if (conn.getContentEncoding() === 'gzip') {
        stream = new JGZIPInputStream(stream)
      }

      const reader = new JBufferedReader(new JInputStreamReader(stream));
      let content = "";

      while (true) {
        let inputLine = reader.readLine();
        if (!inputLine) break;
        content += inputLine;
      }

      reader.close();
      conn.disconnect();

      if (options.json)
        content = JSON.parse(content);

      if (status > 299) {
        reject(content);
      } else if (options.resolveWithFullResponse) {
        const headers = {}
        const headerFields = conn.getHeaderFields();
        headerFields.keySet().forEach((key) => {
          headers[key] = headerFields.get(key)[0];
        });

        resolve({
          statusCode: status,
          statusMessage: conn.getResponseMessage(),
          headers,
          body: content
        });
      } else {
        resolve(content);
      }
    } catch (e) {
      reject(e);
    }
  }).start();
}

export { RequestObj as default };
