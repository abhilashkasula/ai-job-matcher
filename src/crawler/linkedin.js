import fs, { existsSync } from 'fs';
import jobsPage from "../pageobjects/jobs.page.js";
import loginPage from "../pageobjects/login.page.js";
import dotenv from 'dotenv'

dotenv.config()

describe('Linkedin', () => {
  it('Search jobs', async () => {
    await loginPage.open();
    await loginPage.login(process.env.LINKEDIN_USERNAME, process.env.LINKEDIN_PASSWORD);
    await browser.pause(10000);
    await jobsPage.search("Software engineer");
    for (let i = 1; i <= 25; i++) {
      const jobDetail = await jobsPage.getCurrentJobDetail();
      if (!existsSync('data/jobs')) {
        fs.mkdirSync('data/jobs', {recursive: true})
      }
      fs.writeFileSync(`data/jobs/job${i}.json`, JSON.stringify(jobDetail));
      jobsPage.nextJob();
    }
  })
});