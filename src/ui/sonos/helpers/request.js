const reg = /^(\w+): (.+)/;

const request = function(options, callback) {
    const xhr = new XMLHttpRequest();

    if (typeof options === 'string') {
        options = {
            uri: options
        };
    }

    xhr.open(options.method || 'GET', options.uri || options.url);

    if (options.responseType) {
        xhr.responseType = options.responseType;
    }

    if (options.headers) {
        for (const k in options.headers) {
            if (options.headers.hasOwnProperty(k)) {
                xhr.setRequestHeader(k, options.headers[k]);
            }
        }
    }

    xhr.onreadystatechange = function() {
        const headers = {};

        if (xhr.readyState == 4) {
            const response =
                xhr.responseType === 'blob' ? xhr.response : xhr.responseText;

            if (xhr.status === 200) {
                xhr.getAllResponseHeaders().split('\n').forEach(function(l) {
                    const matches = reg.exec(l);

                    if (matches) {
                        headers[String(matches[1]).toLowerCase()] = matches[2];
                    }
                });

                callback(
                    null,
                    {
                        statusCode: xhr.status,
                        headers: headers
                    },
                    response
                );
            } else {
                callback(
                    xhr.status,
                    {
                        statusCode: xhr.status,
                        headers: headers
                    },
                    response
                );
            }
        }
    };

    xhr.send(options.body || null);
};

export default request;
