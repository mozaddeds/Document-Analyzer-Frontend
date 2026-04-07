// components/Input/FileInput.tsx
"use client"

import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { UploadState } from '@/lib/types';
import { uploadWithProgress } from '@/lib/functions';

type FormData = {
  file: FileList;
};

// Add this interface for the structured summary
interface StructuredSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  mainTopics: string[];
}

// Helper function with proper types
const cleanAndStructureSummary = (rawText: string | StructuredSummary): StructuredSummary => {
  // If it's already structured, return it
  if (typeof rawText === 'object' && rawText !== null && 'summary' in rawText) {
    return {
      title: rawText.title || 'Document Summary',
      summary: rawText.summary,
      keyPoints: rawText.keyPoints || [],
      mainTopics: rawText.mainTopics || []
    };
  }

  // If it's a string, clean it
  const text = typeof rawText === 'string' ? rawText : '';

  // Remove markdown formatting
  let cleaned = text
    .replace(/###\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();

  // Default structure
  const sections: StructuredSummary = {
    title: 'Document Summary',
    summary: '',
    keyPoints: [],
    mainTopics: []
  };

  // Extract title (usually first line or after "Summary:")
  const titleMatch = cleaned.match(/^(.+?)[:\n]/) || cleaned.match(/Summary:\s*(.+?)[\n]/);
  if (titleMatch && titleMatch[1]) {
    sections.title = titleMatch[1].trim();
  }

  // Extract main summary (first paragraph after title)
  const summaryMatch = cleaned.match(/[A-Z][^.!?]+[.!?]/);
  if (summaryMatch) {
    sections.summary = summaryMatch[0];
  } else {
    // If no sentence found, take first 150 characters
    sections.summary = cleaned.substring(0, 150);
  }

  // Extract bullet points with proper typing
  const bulletPoints = cleaned.match(/[-*•]\s*([^\n]+)/g);
  if (bulletPoints) {
    sections.keyPoints = bulletPoints.map((point: string): string =>
      point.replace(/[-*•]\s*/, '').trim()
    );
  }

  // Extract numbered sections (1., 2., etc.)
  const numberedPoints = cleaned.match(/\d+\.\s*([^\n]+)/g);
  if (numberedPoints && sections.keyPoints.length === 0) {
    sections.keyPoints = numberedPoints.map((point: string): string =>
      point.replace(/\d+\.\s*/, '').trim()
    );
  }

  return sections;
};

const FileInput = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const [uploadState, setUploadState] = React.useState<UploadState>({ status: 'idle' });

  const [fileName, setFileName] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | true => {
    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  const handleCustomButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const file = data.file[0];

    if (!file) {
      setUploadState({
        status: 'error',
        message: 'No file selected',
        canRetry: false
      });
      return;
    }

    // Validate file
    const validation = validateFile(file);
    if (validation !== true) {
      setUploadState({
        status: 'error',
        message: validation,
        canRetry: false
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadState({ status: 'uploading', progress: 0 });

      const result = await uploadWithProgress(formData, (progress) => {
        setUploadState({ status: 'uploading', progress });
      });

      setUploadState({ status: 'analyzing', attempt: 1, maxAttempts: 3 });
      setUploadState({ status: 'success', data: result });
    } catch (error: any) {
      setUploadState({
        status: 'error',
        message: error.message,
        canRetry: true
      });
    }
  };

  const renderUploadState = () => {
    switch (uploadState.status) {
      case 'idle':
        return null;

      case 'uploading':
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 font-medium">Uploading file...</p>
            <div className="mt-2 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
            <p className="text-sm text-blue-600 mt-1">{uploadState.progress}%</p>
          </div>
        );

      case 'analyzing':
        return (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col items-center">
                {/* Animated icon */}
                <div className="relative w-20 h-20 mb-4">
                  <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Analyzing Your Document
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Our AI is reading and understanding the content...
                </p>

                {/* Progress dots */}
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {uploadState.maxAttempts > 1 && (
                  <p className="text-sm text-gray-500 mt-4">
                    Attempt {uploadState.attempt}/{uploadState.maxAttempts}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'success': {
        const responseData = uploadState.data;
        const summaryData = responseData?.data?.summary;
        const metadata = responseData?.data;

        if (!summaryData) {
          return (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">No summary data received</p>
            </div>
          );
        }

        return (
          <div className="mt-8 max-w-4xl mx-auto">
            {/* Hero card with gradient */}
            <div className="bg-linear-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">

              {/* Success header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Analysis Complete</h3>
                  <p className="text-sm text-gray-600">{metadata?.fileName}</p>
                </div>
              </div>

              {/* Document title */}
              {summaryData.title && (
                <div className="mb-6 pb-4 border-b border-gray-300">
                  <h4 className="text-3xl font-bold text-gray-900">
                    {summaryData.title}
                  </h4>
                </div>
              )}

              {/* Summary section */}
              {summaryData.summary && (
                <div className="mb-6 bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-bold text-lg text-gray-800 mb-2">Executive Summary</h5>
                      <p className="text-gray-700 leading-relaxed">{summaryData.summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key points section */}
              {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                <div className="mb-6 bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-lg text-gray-800 mb-3">Key Highlights</h5>
                      <ul className="space-y-2">
                        {summaryData.keyPoints.map((point: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Main topics section */}
              {summaryData.mainTopics && summaryData.mainTopics.length > 0 && (
                <div className="mb-6 bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-lg text-gray-800 mb-3">Main Topics</h5>
                      <div className="flex flex-wrap gap-2">
                        {summaryData.mainTopics.map((topic: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata footer */}
              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-300">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {(metadata.fileSize / 1024).toFixed(0)} KB
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(metadata.analyzedAt).toLocaleTimeString()}
                  </span>
                </div>

                <button
                  onClick={() => setUploadState({ status: 'idle' })}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Analyze Another Document
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 'error':
        return (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-linear-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-800 mb-2">
                    Analysis Failed
                  </h3>
                  <p className="text-red-700 mb-4">
                    {uploadState.message}
                  </p>

                  {uploadState.canRetry && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setUploadState({ status: 'idle' })}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => {
                          // Reset form
                          setFileName('');
                          setUploadState({ status: 'idle' });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Choose Different File
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='border-2 border-green-500 w-120 p-2 mt-5 rounded-2xl flex flex-row justify-evenly items-center'>

          <label htmlFor="file" className="text-white font-medium">Upload File:</label>

          {/* Hidden native input */}
          <input
            type="file"
            id="file"
            accept='.pdf'
            {...register("file", {
              required: true,
              onChange: handleFileChange,  // Track changes
              validate: (files) => {
                if (!files[0]) return "No file selected";
                return validateFile(files[0]);
              }
            })}
            ref={(e) => {
              register("file").ref(e);  // Call register's ref
              if (fileInputRef.current !== e) {
                fileInputRef.current = e;  // Set your custom ref
              }
            }}
            className="hidden"  // Hide the ugly default input
            disabled={uploadState.status === 'uploading' || uploadState.status === 'analyzing'}
          />



          {/* Custom button/display */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCustomButtonClick}
              disabled={uploadState.status === 'uploading' || uploadState.status === 'analyzing'}
              className="px-4 py-2 bg-gray-700 text-white border border-gray-500 rounded hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              Choose File
            </button>

            <span className="text-white text-sm max-w-48 truncate">
              {fileName || 'No file chosen (Max 10MB, PDF only)'}
            </span>
          </div>

          <button
            type="submit"
            disabled={uploadState.status === 'uploading' || uploadState.status === 'analyzing' || !fileName}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {uploadState.status === 'uploading' || uploadState.status === 'analyzing'
              ? 'Processing...'
              : 'Analyze'
            }
          </button>
        </div>
      </form>

      {renderUploadState()}
    </div>
  );
};

export default FileInput;