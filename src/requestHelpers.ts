import request from 'request';
import { Authentication } from './philipstv.js';

export interface RequestPayload {
    url: string;
    method: string;
    body: string;
    rejectUnauthorized: boolean;
    timeout: number;
    forever: boolean;
    followAllRedirects: boolean;
    auth?: Authentication;
}

export async function doRequest(method: string, url: string, body = '', auth?: Authentication) : Promise<string> {
  return new Promise(( resolve, reject) => {
    const payload : RequestPayload = {
      url: url,
      method: method,
      body: body,
      rejectUnauthorized: false,
      timeout: 5000,
      forever: true,
      followAllRedirects: true,
    };

    if (auth) {
      payload.auth = auth;
    }

    try {
      request(payload, (error, res, body) => {
          console.log('doRequest', res.body)
        if (!error && res.statusCode === 200) {
          resolve(body);
        } else if (error) {
          reject(error);
        } else {
          reject(res);
        }
      });
    } catch {
      reject('Request module failure');
    }

  });
}

export async function get(url: string, body = '', auth?: Authentication) : Promise<string> {
  return doRequest('GET', url, body, auth);
}

export async function post(url: string, body = '', auth?: Authentication) : Promise<string> {
  return doRequest('POST', url, body, auth);
}
