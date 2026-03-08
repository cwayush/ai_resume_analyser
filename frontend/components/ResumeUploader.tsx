'use client';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';

interface Props {
  onFileChange: (f: File | null) => void;
  file: File | null;
}

export default function ResumeUploader({ onFileChange, file }: Props) {
  const onDrop = useCallback(
    (a: File[]) => {
      if (a[0]) onFileChange(a[0]);
    },
    [onFileChange],
  );
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          ['.docx'],
        'application/msword': ['.doc'],
      },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024,
    });
  const fmt = (b: number) =>
    b < 1048576
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1048576).toFixed(1)} MB`;

  if (file) {
    return (
      <div
        className="animate-fadeIn flex items-center gap-3 p-4 rounded-xl"
        style={{
          background: 'rgba(22,163,74,0.07)',
          border: '1px solid rgba(22,163,74,0.3)',
        }}
      >
        <div
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}
        >
          <FileText size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--color-ink-900)' }}
          >
            {file.name}
          </p>
          <p
            className="text-[10px] mt-0.5 tracking-wide font-semibold"
            style={{ color: '#16a34a' }}
          >
            {fmt(file.size)} · READY
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CheckCircle size={14} style={{ color: '#16a34a' }} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(null);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            style={{
              border: '1px solid var(--color-border-2)',
              color: 'var(--color-ink-300)',
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="relative cursor-pointer flex flex-col items-center gap-5 p-10 sm:p-12 transition-all duration-200 rounded-xl"
      style={{
        border: `2px dashed ${isDragReject ? 'rgba(220,38,38,0.5)' : isDragActive ? 'var(--color-gold)' : 'var(--color-border-2)'}`,
        background: isDragReject
          ? 'rgba(220,38,38,0.04)'
          : isDragActive
            ? 'var(--color-gold-bg)'
            : 'var(--color-surface-2)',
      }}
    >
      <input {...getInputProps()} />

      <div
        className="w-14 h-14 flex items-center justify-center rounded-xl shadow-flat-sm transition-transform duration-200"
        style={{
          background: isDragActive
            ? 'linear-gradient(135deg, #c9972b, #f0c860)'
            : 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <UploadCloud
          size={26}
          style={{ color: isDragActive ? '#fff' : 'var(--color-ink-300)' }}
        />
      </div>

      <div className="text-center">
        <p
          className="text-sm font-semibold mb-1.5"
          style={{ color: 'var(--color-ink-900)' }}
        >
          {isDragActive ? 'Drop to upload' : 'Drag & drop your resume'}
        </p>
        <p
          className="text-[10px] tracking-wider font-semibold"
          style={{ color: 'var(--color-ink-300)' }}
        >
          PDF · DOC · DOCX · MAX 5MB
        </p>
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 px-5 h-9 text-sm font-semibold rounded-md transition-all"
        style={{
          background: 'linear-gradient(135deg, #c9972b, #f0c860)',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(201,151,43,0.35)',
        }}
      >
        Browse Files
      </button>
    </div>
  );
}
