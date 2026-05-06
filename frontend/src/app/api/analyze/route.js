import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectToDatabase from '../../lib/mongodb';
import Analysis from '../../../../models/Analysis';

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // 1. Parse the incoming FormData
    const formData = await request.formData();
    const file = formData.get('resume');
    const jobDescription = formData.get('jobDescription');
    const jobTitle = formData.get('jobTitle');

    if (!file || !jobDescription) {
      return NextResponse.json({ error: "Resume and Job Description are required." }, { status: 400 });
    }


    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Pdf = buffer.toString('base64');


    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


    const prompt = `
      You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
      Analyze the provided PDF Resume against the following Job Description.

      Job Description:
      ${jobDescription}

      CRITICAL INSTRUCTION: Return your analysis STRICTLY as a raw JSON object. 
      Do NOT include markdown formatting like \`\`\`json. 
      Use the exact following structure:
      {
        "matchScore": <number between 0-100>,
        "missingKeywords": ["keyword1", "keyword2"],
        "mismatchAnalysis": [
          {
            "resumeSection": "<e.g., Experience, Skills, Summary>",
            "issue": "<Explain what is currently wrong, missing, or weakly phrased>",
            "correction": "<Provide the exact, plain English phrasing the user should use. DO NOT include any LaTeX code in this field. Keep it readable.>"
          }
        ],
        "aiFeedback": "<A short, professional summary paragraph of their overall fit>",
        "improvedResumeLatex": "<Generate a complete, standard article-class LaTeX resume integrating the missing keywords and corrections. DO NOT use markdown code blocks inside this string.>"
      }
    `;

 
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Pdf,
          mimeType: "application/pdf"
        }
      }
    ]);

    let textResponse = result.response.text();


    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(textResponse);


    const newAnalysis = await Analysis.create({
      userId: '000000000000000000000000', 
      jobTitle: jobTitle || 'Analyzed Role',
      matchScore: aiData.matchScore,
      missingKeywords: aiData.missingKeywords,
      mismatchAnalysis: aiData.mismatchAnalysis,
      aiFeedback: aiData.aiFeedback,
      improvedResumeLatex: aiData.improvedResumeLatex
    });

    return NextResponse.json({ success: true, data: newAnalysis }, { status: 201 });

  } catch (err) {
    console.error("Backend Error:", err); 


    if (err.message.includes('503') || err.message.toLowerCase().includes('overloaded') || err.message.toLowerCase().includes('demand')) {
      return NextResponse.json(
        { success: false, error: 'The AI servers are currently experiencing high traffic. Please wait 30 seconds and try again.' }, 
        { status: 503 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: err.message || 'Something went wrong during analysis.' }, 
        { status: 500 }
      );
    }
  }
}