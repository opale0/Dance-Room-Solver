import { Promise } from '../PromiseV2';
import RequestObj from './RequestObj';

/**
 * @type {typeof import("./index").request}
 * 
 * Options modifiers:
 * - url
 * - method: defaults to 'GET'
 * - timeout in ms: defaults to infinity
 * - connectTimeout in ms: defaults to infinity
 * - readTimeout in ms: defaults to infinity
 * - headers
 * - qs: escaped and appended to url
 * - body: represents JSON POST data. Automatically sets 'Content-Type' header to 'application/json; charset=UTF-8' Body takes presedence over 'form'
 * - form: represents form data. Automatically sets 'Content-Type' header to 'x-www-form-urlencoded'
 * - multipart: represents multipart form data. Automatically sets 'Content-Type' header to 'multipart/form-data'
 * - followRedirect: defaults to true
 * - json: automatically parse the output, defaults to false
 * - resolveWithFullResponse: return an object with the status code, status message, headers, and body; defaults to false
 */
export function request(o) {
  let options = {}

  if (typeof o === 'string') {
    options.url = o;
  } else {
    options = o;
  }

  options.method = options.method?.toUpperCase()?.trim() ?? 'GET';
  options.timeout = options.timeout ?? 0;
  options.connectTimeout = options.connectTimeout ?? options.timeout;
  options.readTimeout = options.readTimeout ?? options.timeout;
  options.headers = options.headers ?? {};
  options.qs = options.qs ?? {};
  options.followRedirect = options.followRedirect ?? true;
  options.json = options.json ?? false;

  return new Promise((resolve, reject) => RequestObj(options, resolve, reject));
}

export default request;
