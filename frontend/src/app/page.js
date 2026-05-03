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

      // Make sure the URL matches your actual API route!
      const analyzeRes = await fetch('/api/analyze', { method: 'POST', body: formData });
      
      // NEW: Check if the response is empty or failed before parsing JSON
      if (!analyzeRes.ok) {
         const errorText = await analyzeRes.text(); // Read as text in case it's HTML
         throw new Error(`Server Error: ${analyzeRes.status}. ${errorText.substring(0, 50)}`);
      }

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
    <main className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-300">
      
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-emerald-500 tracking-tight">
          AI Resume Pro
        </h2>
        <Button variant="outline" onClick={handleLogout} className="border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
          Log Out
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100">
            Optimize for the ATS
          </h1>
          <p className="text-zinc-500 text-lg font-medium">
            Upload your PDF and paste the job description. Our AI will handle the rest.
          </p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl rounded-xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resume-upload" className="text-base font-semibold text-zinc-200">1. Upload Resume (PDF)</Label>
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-800/80 transition-colors bg-zinc-900/50">
                <input type="file" id="resume-upload" accept=".pdf" onChange={handleFileChange} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer" />
              </div>
              {file && <p className="text-sm text-emerald-500 font-semibold mt-2">Selected: {file.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jd" className="text-base font-semibold text-zinc-200">2. Paste Job Description</Label>
              <Textarea id="jd" placeholder="Paste the full job description here..." className="min-h-[200px] resize-y bg-zinc-950 border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-emerald-500 rounded-lg" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>

            {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}

            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-500 text-zinc-50 rounded-lg font-semibold shadow-sm transition-colors">
              {isLoading ? 'Analyzing with AI...' : 'Analyze Resume Fit'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1 bg-emerald-600 text-zinc-50 border-none shadow-md rounded-xl">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <h3 className="text-lg font-medium opacity-90">Match Score</h3>
                  <p className="text-6xl font-bold mt-2">{result.matchScore}%</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-zinc-900 border-zinc-800 shadow-sm rounded-xl">
                <CardHeader><CardTitle className="text-zinc-100">AI Assessment</CardTitle></CardHeader>
                <CardContent><p className="text-zinc-400 leading-relaxed font-medium">{result.aiFeedback}</p></CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 shadow-sm rounded-xl">
              <CardHeader><CardTitle className="text-zinc-100">Missing Keywords</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-sm font-semibold">{kw}</span>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight mt-8 text-zinc-100">Required Corrections</h2>
              {result.mismatchAnalysis.map((item, i) => (
                <Card key={i} className="border-l-4 border-l-amber-500 bg-zinc-900 border-y-zinc-800 border-r-zinc-800 shadow-sm rounded-r-xl">
                  <CardContent className="p-5 space-y-3">
                    <span className="font-bold text-amber-500 uppercase tracking-wider text-xs">{item.resumeSection}</span>
                    <p className="font-semibold text-zinc-300">Issue: <span className="font-medium text-zinc-500">{item.issue}</span></p>
                    <p className="font-semibold text-emerald-400 bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20">Fix: <span className="font-medium text-emerald-300">{item.correction}</span></p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {result.improvedResumeLatex && (
              <Card className="shadow-md border-zinc-800 mt-8 overflow-hidden rounded-xl bg-zinc-900">
                <CardHeader className="bg-zinc-950/50 border-b border-zinc-800 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-zinc-100 text-xl">ATS-Optimized LaTeX Code</CardTitle>
                      <p className="text-sm text-zinc-500 mt-2 font-medium">
                        Copy this code and paste it into a blank project on <a href="https://www.overleaf.com/" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Overleaf.com</a>.
                      </p>
                    </div>
                    <Button className="bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 shadow-sm" onClick={() => navigator.clipboard.writeText(result.improvedResumeLatex)}>
                      Copy Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-6 bg-[#09090b] text-emerald-500 overflow-x-auto text-sm max-h-[500px]">
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