import { $ } from '@wdio/globals'
import Page from './page.js';

class Jobs extends Page {

  constructor() {
    super();
    this.currentJob = null;
  }

  get inputKeywords() {
    return $("#jobs-search-box-keyword-id-ember99");
  }

  get jobTitle() {
    return this.currentJob.getText();
  }

  get jobDetail() {
    return $(".jobs-search__job-details--wrapper").getText();
  }

  async getCurrentJobDetail() {
    if (!this.currentJob) {
      this.currentJob = await $("li[data-occludable-job-id]");
    }
    return {url: await browser.getUrl(), title: await this.jobTitle, description: await this.jobDetail}
  }

  async nextJob() {
    this.currentJob = this.currentJob.nextElement()
    await this.currentJob.click();
    (await $('article')).waitForExist({timeout: 3000});
    return this.currentJob;
  }

  search(keywords, locationId = 105556991) {
    return this.open({geoId: locationId, keywords})
  }

  open(params) {
    return super.open('jobs/search', params);
  }
  
}

export default new Jobs();