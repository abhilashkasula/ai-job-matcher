import fs from 'fs'
import { HfInference } from "@huggingface/inference"
import dotenv from 'dotenv'

dotenv.config()

const client = new HfInference(process.env.HUGGINGFACE_TOKEN)
const jobs = fs.readdirSync('data/jobs')

const readStream = (stream) => {
  return new Promise(async (resolve) => {
    let out = ''
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        out += newContent;
        console.log(newContent)
      }  
    }
    resolve(out);
  });
}

const proms = jobs.map(async (job) => {
  const jobDetail = fs.readFileSync(`data/jobs/${job}`).toString();
  const {url} = JSON.parse(jobDetail);
  const stream = client.chatCompletionStream({
    model: "HuggingFaceH4/zephyr-7b-alpha",
    messages: [
      {role: "system", content: "Based on the resume given in markdown, check if the below job description given in html matches to the resume. Generate the json without any other formatting such as code block."},
      { role: "user", content: `
        Extract the information asked from the following resume and job description.
          Resume: ${fs.readFileSync('data/resume_naveen.md').toString()},
          Job description: ${jobDetail},
          Output json schema: {"isAMatch":"Boolean representing the job matches to the resume","title":"Job title","company":"Company mentioned","experienceRequired":"Number representing the years of experience required","tech":"One of the following value, Backend, Frontend, Fullstack, Mobile or Other","type":"One of the following value, Hybrid, Remote or Onsite","isPartTime":"Boolean representing if it is a part time job","postedOn":"Job posted on","isReposted":"Boolean representing if it is reposted?","applyClickCount":"Number representing the number of clicks on apply","skillsMatching":"An array of strings representing the skill match","comment":"Do you think this fits me? If yes, why do you think?"}
        ` }
    ],
    provider: "hf-inference",
    temperature: 0.5,
    top_p: 0.7
  });
  return {url, ...JSON.parse(await readStream(stream))};
});

const results = await Promise.all(proms);
fs.writeFileSync('data/results.json', JSON.stringify(results));
