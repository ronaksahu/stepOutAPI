const request = require("request");

var apiRequest = {
    post:  function (url, body, headers, type, timeout, queryString, formData) {
        var start = new Date();
        console.log("timeout:",timeout);
        var option = {
          body: body,
          timeout : (timeout != undefined && timeout != "") ? timeout : 0 ,
          headers: headers,
          qs: queryString ? queryString : "",
          json: type == "json" ? true : false,
          gzip: true,
          formData: formData
        };
    
     
        // console.log("Options --> ", option);
        return new Promise((resolve, reject) => {
          try {
            request.post(url, option , (err, response, body) => {
              if (err) {
                console.log("error/ time out in ", timeout + err);
                resolve({ status: false, error: err });
              }
    
              console.log("Request time in ms", new Date() - start);
              resolve(body);
            });
           
          } catch (ex) {
            console.log(ex);
            return [];
          }
        });
      
      
      },
      get: function (url, body, headers, timeout ) {
        var start = new Date();
        var cutoff =  (timeout != undefined && timeout != "") ? Number(timeout) : 0
        var option = {
          headers: headers,
          timeout : cutoff,
          qs: body ? body : "",
          gzip: true,
          qsStringifyOptions: { indices: false }
        };
        return new Promise((resolve, reject) => {
          request.get(url, option, (err, res, body) => {
              if (err) {
                console.log("time out in :",timeout);
                resolve({ status: false, error: err });
                }
              //  console.log("res " + JSON.stringify(body));
              console.log("Request time in ms", new Date() - start);
              resolve(body);
            }
          );
        });
      }       
}

module.exports = apiRequest;