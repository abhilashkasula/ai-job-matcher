import fs from 'fs'
// import { HfInference } from "@huggingface/inference"
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

// const client = new HfInference(process.env.HUGGINGFACE_TOKEN)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_TOKEN);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      required: ["isAMatch", "title", "company", "experienceRequired", "tech", "type", "isPartTime", "postedOn", "isReposted", "applyClickCount", "skillsMatching", "comment"],
      properties: {
        isAMatch: {
          "type": "boolean",
          "description": "Boolean representing the job matches to the resume",
        },
        title: {
          type: "string",
          "description": "Job title"
        },
        company: {
          type: "string",
          description: "Company mentioned"
        },
        experienceRequired: {
          type: "number",
          description: "Number representing the years of experience required"
        },
        tech: {
          type: "string",
          enum: ["Backend", "Fronted", "Fullstack", "Mobile", "Other"],
          description: "One of the following value, Backend, Frontend, Fullstack, Mobile or Other"
        },
        type: {
          type: "string",
          enum: ["Hybrid", "Remote", "Onsite", "Other"],
          description: "One of the following value, Hybrid, Remote or Onsite"
        },
        isPartTime: {
          type: "boolean",
          description: "Boolean representing if it is a part time job"
        },
        postedOn: {
          type: "string",
          description: "Time when the job posted on"
        },
        isReposted: {
          type: "boolean",
          description: "Boolean representing if it is reposted"
        },
        applyClickCount: {
          type: "string",
          description: "How many people clicked apply?"
        },
        skillsMatching: {
          type: "array",
          items: {
            type: "string",
            description: "Skill matched"
          },
          description: "An array of strings representing the skill match"
        },
        comment: {
          type: "string",
          description: "Do you think this fits me? If yes, why do you think?"
        }
      }
    }
  }
});

// const prompt = "Explain how AI works";

// const result = await model.generateContent(prompt);
// console.log(result.response.text());
const jobs = fs.readdirSync('data/jobs');

const sleep = (timeout) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), timeout);
  });
};

const results = [];
try {
// const proms = jobs.map(async (job) => {
  for (const index in jobs) {
    const job = jobs[index]
    console.log(index, 'starting');
  const jobDetail = fs.readFileSync(`data/jobs/${job}`).toString();
  const { url } = JSON.parse(jobDetail);
  const result = await model.generateContent(
    `Based on the resume given in markdown, check if the below job description given in html matches to the resume and extract the information asked from the following resume and job description in JSON format.
    Resume: ${fs.readFileSync('data/resume_abhilash.md').toString()},
    Job description: ${jobDetail}
    `,
  );
  console.log(index, 'done');
  console.log(index, 'waiting');
  await (sleep(5 * 1000));
  // const stream = client.chatCompletionStream({
  //   model: "PowerInfer/SmallThinker-3B-Preview",
  //   messages: [
  //     { role: "system", content: "Based on the resume given in markdown, check if the below job description given in html matches to the resume. Generate the json without any other formatting such as code block." },
  //     {
  //       role: "user", content: `
  //       Extract the information asked from the following resume and job description.
  //         Resume: ,
  //         Job description: ,
  //         Output json schema: 
  //       ` }
  //   ],
  //   temperature: 0.5,
  //   top_p: 0.7
  // });

  const res = result.response.text();
  results.push({ url, ...JSON.parse(res), raw: jobDetail });
}
} catch(err) {
  console.error(err);
}
// });

// const results = await Promise.all(proms);
fs.writeFileSync('data/results.json', JSON.stringify(results));
