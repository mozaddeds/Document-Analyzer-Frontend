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
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 font-medium">Analyzing document...</p>
            <p className="text-sm text-yellow-600 mt-1">
              This may take a few moments
              {uploadState.maxAttempts > 1 &&
                ` (Attempt ${uploadState.attempt}/${uploadState.maxAttempts})`
              }
            </p>
            <div className="mt-2">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </div>
        );

      case 'success': {
        // Extract the summary data safely
        const responseData = uploadState.data;
        const summaryData = responseData?.data?.text || responseData?.text;

        let structuredSummary: StructuredSummary | null = null;

        if (summaryData) {
          structuredSummary = cleanAndStructureSummary(summaryData);
        }

        return (
          <div className="mt-4 p-4 w-200 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-medium">✓ Analysis complete!</p>
            <div className="mt-3">
              {structuredSummary ? (
                <div className="space-y-3">
                  {structuredSummary.title && (
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{structuredSummary.title}</h3>
                    </div>
                  )}

                  {structuredSummary.summary && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Summary</h4>
                      <p className="text-gray-600">{structuredSummary.summary}</p>
                    </div>
                  )}

                  {structuredSummary.keyPoints && structuredSummary.keyPoints.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Key Points</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {structuredSummary.keyPoints.map((point: string, idx: number) => (
                          <li key={idx} className="text-gray-600 text-sm">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {structuredSummary.mainTopics && structuredSummary.mainTopics.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Main Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {structuredSummary.mainTopics.map((topic: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <pre className="bg-white p-3 rounded overflow-auto max-h-60 text-sm">
                  {JSON.stringify(uploadState.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      }

      case 'error':
        return (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-medium">✗ Error</p>
            <p className="text-sm text-red-600 mt-1">{uploadState.message}</p>
            {uploadState.canRetry && (
              <button
                onClick={() => setUploadState({ status: 'idle' })}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Try Again
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='border-2 border-green-500 w-120 p-2 mt-5 rounded-2xl flex flex-row justify-evenly'>
          <label htmlFor="file">Upload File:</label>
          <input
            className='bg-gray-700 text-white placeholder:text-gray-400 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-3'
            type="file"
            id="file"
            accept='.pdf'
            {...register("file", { required: true })}
            disabled={uploadState.status === 'uploading' || uploadState.status === 'analyzing'}
          />
          <button
            type="submit"
            disabled={uploadState.status === 'uploading' || uploadState.status === 'analyzing'}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploadState.status === 'uploading' || uploadState.status === 'analyzing'
              ? 'Processing...'
              : 'Submit'
            }
          </button>
        </div>
      </form>

      {renderUploadState()}
    </div>
  );
};

export default FileInput;