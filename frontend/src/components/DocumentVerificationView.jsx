import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, HelpCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyDocument } from '../services/api';

export default function DocumentVerificationView() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('Does this document support the claim that performance or accuracy improved?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Please upload a PDF or text document first.');
      return;
    }
    if (!question.trim()) {
      setError('Please enter a claim or question to verify against the document.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await verifyDocument(file, question);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Document verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Document-Grounded Verification</h2>
            <p className="text-xs text-gray-600">
              Verify claims against local whitepapers, technical specifications, and research PDFs
            </p>
          </div>
        </div>

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-6 text-center transition-colors bg-gray-50">
          <input
            type="file"
            id="docUpload"
            accept=".pdf,.txt,.md"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-blue-600 opacity-80" />
            <span className="text-sm font-medium text-gray-900">
              {file ? file.name : 'Click to select or drop a PDF, TXT, or Markdown document'}
            </span>
            <span className="text-xs text-gray-600">Supported: PDF, Text, Markdown (up to 10MB)</span>
          </label>
        </div>

        {/* Claim / Question Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Factual Proposition to Verify:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Does this document support the claim that latency was reduced by 40%?"
              className="flex-1 bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || !file}
              className="px-5 py-2 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center space-x-2 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Ground & Check</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Verification Result */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  result.verification_status === 'SUPPORTED'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : result.verification_status === 'PARTIALLY_SUPPORTED'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : result.verification_status === 'NOT_FOUND'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}
              >
                Status: {result.verification_status}
              </span>
              <span className="text-xs text-gray-600 font-mono">
                {result.chunks_created} chunks indexed ({result.document_length_chars} chars)
              </span>
            </div>
            <span className="text-xs text-gray-600">{result.filename}</span>
          </div>

          <p className="text-sm text-gray-800">{result.explanation}</p>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Relevant Extracted Passages:
            </h4>
            {result.relevant_passages && result.relevant_passages.length > 0 ? (
              result.relevant_passages.map((p, idx) => (
                <div key={idx} className="p-3 rounded bg-gray-50 border border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-600 font-mono text-[10px]">
                    <span>{p.passage_id}</span>
                    <span>Relevance Match: {p.score}</span>
                  </div>
                  <p className="text-gray-800 italic">"{p.passage}"</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-600">No matching sections found in this document.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
