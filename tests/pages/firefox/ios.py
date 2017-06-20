# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from selenium.webdriver.common.by import By

from pages.firefox.base import FirefoxBasePage


class FirefoxIOSPage(FirefoxBasePage):

    URL_TEMPLATE = '/{locale}/firefox/ios/'

    _app_store_button_locator = (By.CSS_SELECTOR, '.header-download .app-store')

    @property
    def is_app_store_button_displayed(self):
        return self.is_element_displayed(*self._app_store_button_locator)
