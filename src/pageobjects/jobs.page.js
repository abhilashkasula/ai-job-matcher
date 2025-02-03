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

  get shareButton() {
    return $('.social-share__dropdown-trigger');
  }

  async getCurrentJobDetail() {
    if (!this.currentJob) {
      this.currentJob = await $("li[data-occludable-job-id]");
    }
    return {url: await this.getJobLink(), company: await this.getCompany(), title: await this.jobTitle, description: await this.jobDetail}
  }

  async nextJob() {
    this.currentJob = this.currentJob.nextElement()
    await this.currentJob.click();
    (await $('article')).waitForExist({timeout: 3000});
    return this.currentJob;
  }

  async getJobLink() {
    const jobId = await this.currentJob.getAttribute('data-occludable-job-id')
    return `https://www.linkedin.com/jobs/view/${jobId}`
  }

  async getCompany() {
    const company = await $(`.job-details-jobs-unified-top-card__company-name`);
    return (await company.getText()).trim();
  }

  search(keywords, locationId = 105556991) {
    return this.open({geoId: locationId, keywords})
  }

  open(params) {
    return super.open('jobs/search', params);
  }
  
}

export default new Jobs();