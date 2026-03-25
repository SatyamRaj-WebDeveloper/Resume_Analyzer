import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectToDatabase from '../../lib/mongodb';
import Analysis from '../../../../models/Analysis';

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

    // 2. Convert the PDF file to base64 inline data for Gemini
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Pdf = buffer.toString('base64');

    // 3. Initialize Gemini Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. The strict prompt (Same as before)
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
            "correction": "<Provide exact, actionable text the user can copy/paste to fix it>"
          }
        ],
        "aiFeedback": "<A short, professional summary paragraph of their overall fit>",
        "improvedResumeLatex": "<Generate a complete, standard article-class LaTeX resume integrating the missing keywords and corrections. DO NOT use markdown code blocks inside this string.>"
      }
    `;

    // 5. Send BOTH the prompt and the PDF data to Gemini
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

    // Clean and parse the JSON
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(textResponse);

    // 6. Save to Database
    const newAnalysis = await Analysis.create({
      userId: '000000000000000000000000', // Mock ID until Auth is added
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