'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    localStorage.removeItem('user');
    router.push('/login');
    router.refresh();
  };

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
    setIsLoading(true); setError(''); setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const analyzeRes = await fetch('/api/analyze', { method: 'POST', body: formData });
      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) throw new Error(analyzeData.error);
      setResult(analyzeData.data);
    } catch (err) {
      setError(err.message.includes('503') ? 'Servers are busy. Please try again in 30 seconds.' : err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-800 p-4 md:p-8 text-slate-200">
      
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-indigo-400 tracking-tight">
          AI Resume Pro
        </h2>
        <Button variant="outline" onClick={handleLogout} className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white">
          Log Out
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">
            Optimize for the ATS
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            Upload your PDF and paste the job description. Our AI will handle the rest.
          </p>
        </div>

        <Card className="bg-slate-700 border-slate-600 shadow-lg rounded-xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resume-upload" className="text-base font-semibold text-slate-200">1. Upload Resume (PDF)</Label>
              <div className="border-2 border-dashed border-slate-500 rounded-lg p-8 text-center hover:bg-slate-600/50 transition-colors bg-slate-800/50">
                <input type="file" id="resume-upload" accept=".pdf" onChange={handleFileChange} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer" />
              </div>
              {file && <p className="text-sm text-emerald-400 font-semibold mt-2">Selected: {file.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jd" className="text-base font-semibold text-slate-200">2. Paste Job Description</Label>
              <Textarea id="jd" placeholder="Paste the full job description here..." className="min-h-[200px] resize-y bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500 rounded-lg" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>

            {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}

            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full text-lg py-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold shadow-sm">
              {isLoading ? 'Analyzing with AI...' : 'Analyze Resume Fit'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1 bg-indigo-500 text-white border-none shadow-md rounded-xl">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <h3 className="text-lg font-medium opacity-90">Match Score</h3>
                  <p className="text-6xl font-bold mt-2">{result.matchScore}%</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-slate-700 border-slate-600 shadow-sm rounded-xl">
                <CardHeader><CardTitle className="text-slate-100">AI Assessment</CardTitle></CardHeader>
                <CardContent><p className="text-slate-300 leading-relaxed font-medium">{result.aiFeedback}</p></CardContent>
              </Card>
            </div>

            <Card className="bg-slate-700 border-slate-600 shadow-sm rounded-xl">
              <CardHeader><CardTitle className="text-slate-100">Missing Keywords</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-sm font-semibold">{kw}</span>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight mt-8 text-slate-100">Required Corrections</h2>
              {result.mismatchAnalysis.map((item, i) => (
                <Card key={i} className="border-l-4 border-l-amber-500 bg-slate-700 border-y-slate-600 border-r-slate-600 shadow-sm rounded-r-xl">
                  <CardContent className="p-5 space-y-3">
                    <span className="font-bold text-amber-500 uppercase tracking-wider text-xs">{item.resumeSection}</span>
                    <p className="font-semibold text-slate-200">Issue: <span className="font-medium text-slate-400">{item.issue}</span></p>
                    <p className="font-semibold text-emerald-300 bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20">Fix: <span className="font-medium text-emerald-200">{item.correction}</span></p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {result.improvedResumeLatex && (
              <Card className="shadow-md border-slate-600 mt-8 overflow-hidden rounded-xl bg-slate-700">
                <CardHeader className="bg-slate-800/50 border-b border-slate-600 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-slate-100 text-xl">ATS-Optimized LaTeX Code</CardTitle>
                      <p className="text-sm text-slate-400 mt-2 font-medium">
                        Copy this code and paste it into a blank project on <a href="https://www.overleaf.com/" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-400 hover:text-indigo-300">Overleaf.com</a>.
                      </p>
                    </div>
                    <Button className="bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 shadow-sm" onClick={() => navigator.clipboard.writeText(result.improvedResumeLatex)}>
                      Copy Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-6 bg-slate-900 text-emerald-400 overflow-x-auto text-sm max-h-[500px]">
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