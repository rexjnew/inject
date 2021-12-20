const express = require('express');

const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}

async function myAsyncFn(match) {
    // match is an url for example.
    //const s = await fetch(match).then(r => r.json());
    console.log(match);
    const s = '</head>' + '<script type="text/javascript">alert("inject done!")</script></head>'
    return s;
}


const proxy = createProxyMiddleware({
  /**
   * IMPORTANT: avoid res.end being called automatically
   **/
  selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()

  /**
   * Intercept response and replace 'Hello' with 'Goodbye'
   **/
  target: 'http://172.18.115.184:8001', // target host
  changeOrigin: true, // needed for virtual hosted sites
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    const response = responseBuffer.toString('utf8'); // convert buffer to string
    const replacedString = await replaceAsync(response, /<\/head>/g, myAsyncFn);
    // replaceAsync(response, /<head\/>/g, async (match, name) => {
    //   //let color = await getColorByName(name);
    //   return '</head>' + '<script type="text/javascript">alter("inject done!")</script></head>';
    // });

    //await console.log(response);
    //return response; // manipulate response and return the result

   return replacedString.replace('Hello', 'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
  }),

});

// create the proxy (without context)
//const exampleProxy = createProxyMiddleware(options);

// mount `exampleProxy` in web server
