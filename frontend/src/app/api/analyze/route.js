import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectToDatabase from '@/lib/mongodb';
import Analysis from '@/models/Analysis';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    await connectToDatabase();
    

    const { userId, jobTitle, resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Resume and Job Description are required." }, { status: 400 });
    }


    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
      Analyze the following Resume against the provided Job Description.

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
            "correction": "<Provide exact, actionable text the user can copy/paste to fix it>"
          }
        ],
        "aiFeedback": "<A short, professional summary paragraph of their overall fit>",
        "improvedResumeLatex": "<Generate a complete, standard article-class LaTeX resume integrating the missing keywords and corrections. DO NOT use markdown code blocks inside this string.>"
      }

      Resume Text:
      ${resumeText}

      Job Description:
      ${jobDescription}
    `;

 
    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    

    const aiData = JSON.parse(textResponse);


    const newAnalysis = await Analysis.create({
      userId: userId || '000000000000000000000000', 
      jobTitle: jobTitle || 'Analyzed Role',
      matchScore: aiData.matchScore,
      missingKeywords: aiData.missingKeywords,
      mismatchAnalysis: aiData.mismatchAnalysis,
      aiFeedback: aiData.aiFeedback,
      improvedResumeLatex: aiData.improvedResumeLatex
    });

    
    return NextResponse.json({ success: true, data: newAnalysis }, { status: 201 });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to analyze resume." }, { status: 500 });
  }
}