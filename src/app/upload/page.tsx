'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

export default function UploadPage() {
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [submissionMessage, setSubmissionMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const uploadEnabled = process.env.NEXT_PUBLIC_UPLOAD_ENABLED === 'true';

  useEffect(() => {
    if (uploadEnabled) {
      fetch('/category.json')
        .then((res) => res.json())
        .then((data: string[]) => {
          setCategories(data);
          if (data.length > 0) {
            setCategory(data[0]);
          }
        });
    }
  }, [uploadEnabled]);

  if (!uploadEnabled) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">This page is not available in the current environment.</p>
      </div>
    );
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('文件大小不能超过50MB');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setTitle(selectedFile.name.replace(/\.mp3$/, ''));
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
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
    setSubmissionMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('category', category);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionMessage('提交成功！');
        setTitle('');
        setArtist('');
        setFile(null);
        setFileName('');
        if (categories.length > 0) {
          setCategory(categories[0]);
        }
        setTimeout(() => setSubmissionMessage(''), 3000);
      } else {
        setSubmissionMessage(`提交失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionMessage('提交失败: 发生网络错误。');
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
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
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
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100">
              {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            <div className="mt-2 flex items-center space-x-2">
              <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="或添加新分类" disabled={isSubmitting} className="mt-1 flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
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
