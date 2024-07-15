import request from 'request';
export async function doRequest(method, url, body = '', auth) {
    return new Promise((resolve, reject) => {
        const payload = {
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
                console.log('doRequest', res.body);
                if (!error && res.statusCode === 200) {
                    resolve(body);
                }
                else if (error) {
                    reject(error);
                }
                else {
                    reject(res);
                }
            });
        }
        catch {
            reject('Request module failure');
        }
    });
}
export async function get(url, body = '', auth) {
    return doRequest('GET', url, body, auth);
}
export async function post(url, body = '', auth) {
    return doRequest('POST', url, body, auth);
}
//# sourceMappingURL=requestHelpers.js.map