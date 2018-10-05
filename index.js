/**
 * Module dependencies
 */

/**
 * Module exports.
 */

/**
 * Callback index.
 */

var count = 0;

/**
 * Noop function.
 */

function noop() {}

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

export default function jsonp(url, opts = {}) {
  const prefix = opts.prefix || "__jp";

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  let id = opts.name || prefix + count++;

  var param = opts.param || "callback";
  const timeout = null != opts.timeout ? opts.timeout : 60000;
  const target = document.getElementsByTagName("script")[0] || document.head;
  let script;
  let timer;

  return new Promise((resolve, reject) => {
    if (timeout) {
      timer = setTimeout(function() {
        cleanup();
        reject(new Error("Timeout"));
      }, timeout);
    }

    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      window[id] = noop;
      if (timer) clearTimeout(timer);
    }

    function cancel() {
      if (window[id]) {
        cleanup();
      }
    }

    window[id] = function(data) {
      cleanup();
      resolve(data);
    };

    // add qs component
    url +=
      (~url.indexOf("?") ? "&" : "?") + param + "=" + encodeURIComponent(id);
    url = url.replace("?&", "?");

    // create script
    script = document.createElement("script");
    script.src = url;
    target.parentNode.insertBefore(script, target);

    return cancel;
  });
}
