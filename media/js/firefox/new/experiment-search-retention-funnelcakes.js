/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
    'use strict';

    var experimentId = 'experiment_search_retention_funnelcake';

    // swiped from mozilla-client.js
    var ua = navigator.userAgent;
    var isLikeFirefox = /Iceweasel|IceCat|SeaMonkey|Camino|like\ Firefox/i.test(ua);
    var isFirefox = /\s(Firefox|FxiOS)/.test(ua) && !isLikeFirefox(ua);
    var isMobile = /^(android|ios|fxos)$/.test(window.site.platform);

    var hasCookie = Mozilla.Cookies.hasItem(experimentId);
    var fcRe = /^.*\?.*f=\d{3}.*/;

    // 0. if visitor already has a cookie for this experiment, skip the expenisve checks below
    if (hasCookie) {
        runExperiment();
    }
    // 1. check to make sure user is on windows and not fx
    // 1.1 extra check around DNT so we don't do unnecessary geolookups
    // 1.2 make sure user isn't on a variation
    else if (!fcRe.test(document.location.search) && window.site.platform === 'windows' && !isFirefox && !isMobile && typeof Mozilla.dntEnabled === 'function' && !Mozilla.dntEnabled()) {
        // 2. check geolocation for US
        var xhr = new XMLHttpRequest();

        xhr.onload = function(r) {
            if (r.target.status >= 200 && r.target.status < 300) {
                var country;

                try {
                    country = r.target.response.country_code.toLowerCase();
                } catch (e) {
                    // unset var above is good enough
                }

                if (country === 'us') {
                    runExperiment();
                }
            }
        };

        xhr.open('GET', 'https://location.services.mozilla.com/v1/country?key=a9b98c12-d9d5-4015-a2db-63536c26dc14');
        xhr.timeout = 3000;
        xhr.responseType = 'json';
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
