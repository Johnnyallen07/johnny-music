'use client';

import { useState, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useUploadMusic } from '@/hooks/useUpload'; // Import useUploadMusic
import { useQueryClient } from '@tanstack/react-query';

export default function UploadPage() {
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [submissionMessage, setSubmissionMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const uploadEnabled = process.env.NEXT_PUBLIC_UPLOAD_ENABLED === 'true';

  const { config, loading: categoriesLoading } = useCategories();
  const categories = config.categories; // Derived from config
  const uploadMusicMutation = useUploadMusic(); // Use the combined hook
  const queryClient = useQueryClient();

  useEffect(() => {
    if (categories.length > 0) {
      setCategory(categories[0].en);
    }
  }, [categories]);

  if (!uploadEnabled) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">This page is not available in the current environment.</p>
      </div>
    );
  }

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('文件大小不能超过50MB');
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setTitle(selectedFile.name.replace(/\.mp3$/, ''));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.some(cat => cat.en === newCategory)) {
      // This is a temporary update on the client-side.
      // The actual category is added when the form is submitted.
      setCategory(newCategory);
      setNewCategory('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('请选择要上传的MP3文件。');
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage('开始上传...');

    try {
      await uploadMusicMutation.mutateAsync({
        file,
        musicInfo: {
          title,
          artist,
          category: newCategory || category,
          id: crypto.randomUUID(),
        },
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['music'] });
          setSubmissionMessage('提交成功！');
          setTitle('');
          setArtist('');
          setFile(null);
          setFileName('');
          if (categories.length > 0) {
            setCategory(categories[0].en);
          }
          setTimeout(() => setSubmissionMessage(''), 3000);
        },
        onError: (error: Error) => {
          console.error('Submission error:', error);
          const message = error instanceof Error ? error.message : '发生网络错误。';
          setSubmissionMessage(`提交失败: ${message}`);
        }
      });
    } catch (error: unknown) { // Catch any errors from mutateAsync or other parts of the try block
      console.error('Submission error:', error);
      const message = error instanceof Error ? error.message : '发生网络错误。';
      setSubmissionMessage(`提交失败: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">上传音乐</h1>

        {submissionMessage && (
          <div className={`mb-4 p-4 text-sm rounded-lg ${submissionMessage.includes('失败') ? 'text-red-700 bg-red-100 dark:bg-red-200 dark:text-red-800' : 'text-green-700 bg-green-100 dark:bg-green-200 dark:text-green-800'}`} role="alert">
            <span className="font-medium">{submissionMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              MP3 文件
            </label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'} border-dashed rounded-md`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>上传文件</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".mp3" onChange={handleFileChange} disabled={isSubmitting} />
                  </label>
                  <p className="pl-1">或拖放文件</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">MP3 小于 50MB</p>
                {fileName && <p className="text-sm text-green-600 mt-2">已选择: {fileName}</p>}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">名称</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 dark:text-gray-300">作曲家</label>
            <input type="text" id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} required disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">分类</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSubmitting || categoriesLoading} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100">
              {categories.map((cat) => (<option key={cat.id} value={cat.en}>{cat.en}</option>))}
            </select>
            <div className="mt-2 flex items-center space-x-2">
              <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="或添加新分类" disabled={isSubmitting} className="mt-1 flex-1 px-3 py-2 bg-white dark:bg-gamma-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
              <button type="button" onClick={handleAddCategory} disabled={isSubmitting} className="mt-1 px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap">添加</button>
            </div>
          </div>

          <div>
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {isSubmitting ? '提交中...' : '提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
