import nodemailer from "nodemailer";
import fs from 'fs';
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendEmail = async (subject, html) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject,
    html,
  });
};

const generateMatchingJobs = (jobs) => {
  return jobs.reduce((html, job) => {
    const card = `
      <div class="job-card">
        <div class="job-title">
            <a href="${job.url}" target="_blank">
                ${job.title}
            </a>
        </div>
        <div style="display: flex;">
            <div style="width: 50%;">
                <div class="info">Company: ${job.company}</div>
                <div class="info">Experience Required: ${job.experienceRequired}</div>
                <div class="info">Tech: ${job.tech}</div>
                <div class="info">Type: ${job.type}</div>
            </div>
            <div>
                <div class="info">Part-Time: ${job.isPartTime}</div>
                <div class="info">Posted On: ${job.postedOn}</div>
                <div class="info">Reposted: ${job.isReposted}</div>
                <div class="info">Apply Click Count: ${job.applyClickCount}</div>
            </div>
        </div>
        <div class="skills">
            <strong>Skills Matching:</strong>
            ${(job.skillsMatching || job.skillsmatching).reduce((html, skill) => html + `<span>${skill}</span>`, '')}
        </div>
        <div class="comment">
            ${job.comment}
        </div>
      </div>`;
    return html + card;
  }, '');
};

const generateUnMatchingJobs = (jobs) => {
  return jobs.reduce((html, job) => {
    const card = `
                  <div class="job-card">
                    <div class="job-title">
                        <a href="${job.url}" target="_blank">
                            ${job.title}
                        </a>
                    </div>
                    <div class="info">Company: ${job.company}</div>
                    <div class="info">Experience Required: ${job.experienceRequired}</div>
                    <div class="comment unmatch-comment">
                        ${job.comment}
                    </div>
                </div>  
                `;
    return html + card;
  }, '')
};

const prepareHtml = () => {
  const results = JSON.parse(fs.readFileSync('data/results.json').toString());
  const { matching, unmatching } = results.reduce((acc, job) => {
    const jobs = job.isAMatch ? acc.matching : acc.unmatching;
    jobs.push(job);
    return acc;
  }, { matching: [], unmatching: [] })
  const matchingJobsHtml = generateMatchingJobs(matching)
  const unMatchingJobsHtml = generateUnMatchingJobs(unmatching)
  const template = fs.readFileSync('src/template/index.html').toString();
  return template
    .replace('__MATHING__JOBS__', matchingJobsHtml)
    .replace('__UNMATHING__JOBS__', unMatchingJobsHtml);
};

const main = () => {
  const html = prepareHtml()
  sendEmail('Your Job Matches In LinkedIn', html);
};

main();

