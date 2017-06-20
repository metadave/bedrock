/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
    'use strict';

    var experimentId = 'experiment_search_retention_funnelcake';
    var geoNonmatchCookie = experimentId + '_nonUS';

    var isIELT10 = /MSIE\s[1-9]\./.test(navigator.userAgent);

    // swiped from mozilla-client.js
    var ua = navigator.userAgent;
    var isLikeFirefox = /Iceweasel|IceCat|SeaMonkey|Camino|like\ Firefox/i.test(ua);
    var isFirefox = /\s(Firefox|FxiOS)/.test(ua) && !isLikeFirefox(ua);
    var isMobile = /^(android|ios|fxos)$/.test(window.site.platform);

    var hasVariationCookie = Mozilla.Cookies.hasItem(experimentId);
    var hasGeoNonmatchCookie = Mozilla.Cookies.hasItem(geoNonmatchCookie);
    var isWindows = window.site.platform === 'windows';
    var isFunnelcake = /^.*\?.*f=\d{3}.*/.test(document.location.search);
    var dntOk = (typeof Mozilla.dntEnabled === 'function' && !Mozilla.dntEnabled());

    // 0. if visitor previously failed the geolookup, skip everything
    if (hasGeoNonmatchCookie) {
        return;
    }

    // 1. if visitor already has a cookie for this experiment, skip the expenisve
    // checks below and run experiment (uses variation in the cookie)
    if (hasVariationCookie) {
        runExperiment();
    }
    // 2. experiment criteria prior to expensive geolookup check:
    //      a. is not currently on a funnelcake URL (sanity infinite loop check)
    //      b. is on Windows
    //      c. on IE 11 or greater (cross-origin will fail IE 10 and below)
    //      d. is not on Firefox
    //      e. is not on a mobile browser
    //      f. DNT is detectable and off
    else if (!isFunnelcake && isWindows && !isIELT10 && !isFirefox && !isMobile && dntOk) {
        // 2. check geolocation for US
        var xhr = new XMLHttpRequest();

        xhr.onload = function(r) {
            if (r.target.status >= 200 && r.target.status < 300) {
                var country;

                try {
                    country = r.target.response.country_code.toLowerCase();
                } catch (e) {
                    country = 'none';
                }

                if (country === 'us') {
                    runExperiment();
                } else {
                    // store cookie for two days
                    var d = new Date();
                    d.setHours(d.getHours() + 48);
                    Mozilla.Cookies.setItem(geoNonmatchCookie, country, d);
                }
            }
        };


        xhr.open('GET', 'https://location.services.mozilla.com/v1/country?key=a9b98c12-d9d5-4015-a2db-63536c26dc14');
        // must come after open for IE 11
        xhr.responseType = 'json';
        xhr.timeout = 2000;
        xhr.send();
    }

    function runExperiment() {
        var landsman = new Mozilla.TrafficCop({
            id: experimentId,
            variations: {
                'f=114': 9,
                'f=115': 9,
                'f=116': 34,
                'f=117': 9,
                'f=118': 34
            }
        });

        landsman.init();
    }
})(window.Mozilla);
