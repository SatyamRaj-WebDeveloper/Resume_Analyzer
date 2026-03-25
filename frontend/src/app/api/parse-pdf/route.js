import { NextResponse } from 'next/server';
const pdfParse = require('pdf-parse');

export  async function POST(request) {
  try {
    
    const data = await request.formData();
    
    
    const file = data.get('resume');

   
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No PDF file provided.' },
        { status: 400 }
      );
    }


    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);


    const parsedData = await pdfParse(buffer);


    const rawText = parsedData.text;
    const cleanText = rawText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();


    return NextResponse.json({ 
      success: true, 
      text: cleanText 
    }, { status: 200 });

  } catch (error) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse the PDF document.' },
      { status: 500 }
    );
  }
}