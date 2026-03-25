'use client';

import { useState } from 'react';
// Assuming you added these via shadcn: npx shadcn-ui@latest add button card textarea label
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid PDF file.');
      setFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      setError('Both a Resume (PDF) and a Job Description are required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Create a form data object to send BOTH the file and the text at once
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);
      formData.append('jobTitle', 'Target Role');

      // Send directly to the analyze route
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        // Note: Do NOT set 'Content-Type': 'application/json' here. 
        // The browser automatically sets the correct multipart/form-data headers.
        body: formData, 
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) throw new Error(analyzeData.error);

      setResult(analyzeData.data);
    } catch (err) {
      setError(err.message || 'Something went wrong during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            AI Resume Analyzer
          </h1>
          <p className="text-slate-500 text-lg">
            Upload your resume and paste the job description to get a deep-dive match analysis.
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 space-y-6">
            
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume-upload" className="text-base font-semibold">
                1. Upload Resume (PDF)
              </Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                <input 
                  type="file" 
                  id="resume-upload" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              {file && <p className="text-sm text-green-600 font-medium mt-2">Selected: {file.name}</p>}
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="jd" className="text-base font-semibold">
                2. Paste Job Description
              </Label>
              <Textarea 
                id="jd" 
                placeholder="Paste the full job description here..." 
                className="min-h-[200px] resize-y"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

            {/* Submit Button */}
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading} 
              className="w-full text-lg py-6"
            >
              {isLoading ? 'Analyzing with AI...' : 'Analyze Resume Fit'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1 bg-blue-600 text-white border-none shadow-md">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <h3 className="text-lg font-medium opacity-90">Match Score</h3>
                  <p className="text-6xl font-bold mt-2">{result.matchScore}%</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>AI Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{result.aiFeedback}</p>
                </CardContent>
              </Card>
            </div>

            {/* Missing Keywords */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Missing Keywords</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {kw}
                  </span>
                ))}
              </CardContent>
            </Card>

            {/* Mismatch Analysis */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight mt-8">Required Corrections</h2>
              {result.mismatchAnalysis.map((item, i) => (
                <Card key={i} className="border-l-4 border-l-amber-500 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-700 uppercase tracking-wider text-xs">{item.resumeSection}</span>
                    </div>
                    <p className="font-medium text-slate-900">Issue: <span className="font-normal text-slate-700">{item.issue}</span></p>
                    <p className="font-medium text-green-700 bg-green-50 p-3 rounded-md border border-green-100">Fix: <span className="font-normal text-green-800">{item.correction}</span></p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generated LaTeX */}
            {result.improvedResumeLatex && (
              <Card className="shadow-xl border-indigo-200 mt-8 overflow-hidden rounded-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-600 border-b border-indigo-100 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-white text-xl">ATS-Optimized LaTeX Code</CardTitle>
                      <p className="text-sm text-indigo-100 mt-1">
                        Copy this code and paste it into a new, blank project on <a href="https://www.overleaf.com/" target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-indigo-200 transition-colors">Overleaf.com</a> to instantly generate your PDF resume.
                      </p>
                    </div>
                    <Button 
                      className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm" 
                      onClick={() => navigator.clipboard.writeText(result.improvedResumeLatex)}
                    >
                      Copy Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-6 bg-slate-900 text-emerald-400 overflow-x-auto text-sm max-h-[500px] custom-scrollbar">
                    <code>{result.improvedResumeLatex}</code>
                  </pre>
                </CardContent>
              </Card>
            )}
            
          </div>
        )}
      </div>
    </main>
  );
}