import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getCodeReview(code: string, language: string) {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are a senior software engineer of Google with 10+ year of experience.
                You review code strictly and professionally with 100% accuracy.
                You always respond in exact JSON format given to you - nothing else.
                No extra text , no markdown , no explaination outside the JSON.
                You must respond with ONLY raw JSON — no markdown, no backticks, no \`\`\`json, no extra text.
                Start your response directly with { and end with }.
                `,
      },
      {
        role: "user",
        content: `Review this ${language} code and respond only in JSON format:
                {
                    "summary":"one line overall summary of the code",
                    "bugs":[
                        {"line":"line number or area","issue":"what the bug is ","fix":"how to fix it"}
                    ],
                    "improvements":[
                    {"suggestion":"what to improve in code","reason":"why it matters"}
                    ],
                    "quality":{
                        "scores":"a score out of 10",
                        "comment":"one line about the overall code quality"
                    }
                }
                Code to review:\`\`\`${language} ${code}\`\`\`
                `,
      },
    ],
  });
  //console.log(JSON.stringify(response, null, 2));
  const message = response.choices[0].message.content;
  if (!message) {
    throw new Error("Empty response from AI");
  }
  return message;
}
