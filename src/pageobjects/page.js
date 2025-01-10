import { browser } from '@wdio/globals'

/**
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
export default class Page {
    /**
    * Opens a sub page of the page
    * @param path path of the sub page (e.g. /path/to/page.html)
    */
    open(path, params = {}) {
        const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`);
        const query = queryParams.join('&');
        const url = path + (query ? `?${query}` : '');
        return browser.url(new URL(url, 'https://www.linkedin.com/').href)
    }
}
