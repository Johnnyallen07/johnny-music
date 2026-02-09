'use client';

import { useState, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react';
import { useCategories } from '@johnny/api';
import { useUploadMusic } from '@johnny/api';
import { useQueryClient } from '@tanstack/react-query';

interface FileMetadata {
  title: string;
  titleZh: string;
}

export default function UploadPage() {
  // Batch upload state
  const [files, setFiles] = useState<File[]>([]);
  const [filesMetadata, setFilesMetadata] = useState<Record<string, FileMetadata>>({});

  // Common metadata state
  const [artist, setArtist] = useState<string>('');
  const [artistZh, setArtistZh] = useState<string>('');
  const [performer, setPerformer] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categoryZh, setCategoryZh] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [series, setSeries] = useState<string>('');
  const [seriesZh, setSeriesZh] = useState<string>('');
  const [newSeries, setNewSeries] = useState<string>('');
  const [newArtist, setNewArtist] = useState<string>('');

  const [submissionMessage, setSubmissionMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const uploadEnabled = process.env.NEXT_PUBLIC_UPLOAD_ENABLED === 'true';

  const { config, loading: categoriesLoading } = useCategories();
  const categories = config.categories || [];
  const musicians = config.musicians || [];
  const seriesList = config.series || [];
  const uploadMusicMutation = useUploadMusic();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].en);
    }
  }, [categories, category]);

  useEffect(() => {
    if (musicians.length > 0 && !artist) {
      setArtist(musicians[0].en);
      setArtistZh(musicians[0].zh);
    }
  }, [musicians, artist]);

  if (!uploadEnabled) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">This page is not available in the current environment.</p>
      </div>
    );
  }

  const handleFileSelection = (selectedFiles: FileList | File[]) => {
    const newFiles: File[] = [];
    const newMetadata: Record<string, FileMetadata> = { ...filesMetadata };
    const fileList = selectedFiles instanceof FileList ? Array.from(selectedFiles) : selectedFiles;

    for (const file of fileList) {
      if (file.size > 50 * 1024 * 1024) {
        alert(`文件 ${file.name} 大小不能超过50MB`);
        continue;
      }
      // Check if file already exists in current list to avoid duplicates if needed,
      // but for now let's allow adding more.
      // Actually, standard input behavior replaces. Let's append if checking, or replace if simpler.
      // The prompt implies "batch upload", usually means adding multiple.
      // Let's go with appending newly selected files to existing list.

      const isDuplicate = files.some(f => f.name === file.name && f.size === file.size);
      if (!isDuplicate) {
        newFiles.push(file);
        const nameWithoutExt = file.name.replace(/\.mp3$/, '');
        // Use a unique key for metadata, usually filename is enough for simple usage
        // but if user uploads same file twice it might be tricky.
        // Let's assume filename is unique enough for this session context.
        newMetadata[file.name] = {
          title: nameWithoutExt,
          titleZh: nameWithoutExt,
        };
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setFilesMetadata(newMetadata);
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    const newMeta = { ...filesMetadata };
    delete newMeta[fileName];
    setFilesMetadata(newMeta);
  };

  const updateFileMetadata = (fileName: string, field: keyof FileMetadata, value: string) => {
    setFilesMetadata(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        [field]: value,
      },
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
    // Reset input value so same files can be selected again if needed (though we handle duplicates check)
    e.target.value = '';
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedEn = e.target.value;
    setCategory(selectedEn);
    if (selectedEn === '__NEW__') {
      setCategoryZh('');
      setNewCategory('');
    }
  };

  const handleAddCategory = () => {
    if (newCategory) {
      setCategory(newCategory);
      setNewCategory('');
    }
  };

  const handleArtistChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedEn = e.target.value;
    setArtist(selectedEn);
    if (selectedEn === '__NEW__') {
      setArtistZh('');
      setNewArtist('');
    } else {
      const selected = musicians.find(m => m.en === selectedEn);
      if (selected) {
        setArtistZh(selected.zh);
      }
    }
  };

  const handleAddArtist = () => {
    if (newArtist) {
      setArtist(newArtist);
      setNewArtist('');
    }
  };

  const handleSeriesChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedEn = e.target.value;
    setSeries(selectedEn);
    if (selectedEn === '__NEW__') {
      setSeriesZh('');
      setNewSeries('');
    } else {
      const selected = seriesList.find(s => s.en === selectedEn);
      if (selected) {
        setSeriesZh(selected.zh);
      } else {
        if (selectedEn === '') setSeriesZh('');
      }
    }
  };

  const handleAddSeries = () => {
    if (newSeries) {
      setSeries(newSeries);
      setNewSeries('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('请选择至少一个要上传的MP3文件。');
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage('准备上传...');
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const meta = filesMetadata[file.name] || { title: file.name.replace(/\.mp3$/, ''), titleZh: '' };

        setUploadProgress(`正在上传 (${i + 1}/${files.length}): ${file.name}`);

        try {
          await uploadMusicMutation.mutateAsync({
            file,
            musicInfo: {
              title: meta.title,
              title_zh: meta.titleZh,
              artist: artist === '__NEW__' ? newArtist : artist,
              artist_zh: artist === '__NEW__' ? artistZh : (musicians.find(m => m.en === artist)?.zh || artistZh),
              performer,
              category: category === '__NEW__' ? newCategory : category,
              category_zh: categoryZh,
              series: series === '__NEW__' ? newSeries : series,
              series_zh: series === '__NEW__' ? seriesZh : (seriesList.find(s => s.en === series)?.zh || seriesZh),
              id: crypto.randomUUID(),
            },
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          failCount++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['music'] });

      if (failCount === 0) {
        setSubmissionMessage(`全部 ${successCount} 个文件上传成功！`);
        setFiles([]);
        setFilesMetadata({});
      } else {
        setSubmissionMessage(`上传完成: ${successCount} 成功, ${failCount} 失败。`);
      }

      // Reset common fields if desired, or keep them for next batch?
      // Keeping them is usually better for batch operations. 
      // User only asked for batch operation, usually implies reusing common data.
      setTimeout(() => {
        if (failCount === 0) setSubmissionMessage('');
        setUploadProgress('');
      }, 3000);

    } catch (error: unknown) {
      console.error('Batch submission error:', error);
      const message = error instanceof Error ? error.message : '发生网络错误。';
      setSubmissionMessage(`上传过程发生错误: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">批量上传音乐</h1>

        {submissionMessage && (
          <div className={`mb-4 p-4 text-sm rounded-lg ${submissionMessage.includes('失败') || submissionMessage.includes('错误') ? 'text-red-700 bg-red-100 dark:bg-red-200 dark:text-red-800' : 'text-green-700 bg-green-100 dark:bg-green-200 dark:text-green-800'}`} role="alert">
            <span className="font-medium">{submissionMessage}</span>
          </div>
        )}

        {uploadProgress && (
          <div className="mb-4 p-2 text-sm text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-lg text-center">
            {uploadProgress}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* File Upload Area */}
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              MP3 文件 (支持多选)
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
                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>选择文件</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".mp3" multiple onChange={handleFileChange} disabled={isSubmitting} />
                  </label>
                  <p className="pl-1">或拖放文件</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">单文件 MP3 小于 50MB</p>
              </div>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 sticky top-0 bg-white dark:bg-gray-800 pb-2 border-b border-gray-200 dark:border-gray-700">
                已选择 {files.length} 个文件
              </h3>
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                    disabled={isSubmitting}
                  >
                    删除
                  </button>
                  <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 font-mono break-all pr-8">
                    {file.name} ({Math.round(file.size / 1024 / 1024 * 100) / 100} MB)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Name (English)</label>
                      <input
                        type="text"
                        value={filesMetadata[file.name]?.title || ''}
                        onChange={(e) => updateFileMetadata(file.name, 'title', e.target.value)}
                        disabled={isSubmitting}
                        className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">名称 (中文)</label>
                      <input
                        type="text"
                        value={filesMetadata[file.name]?.titleZh || ''}
                        onChange={(e) => updateFileMetadata(file.name, 'titleZh', e.target.value)}
                        disabled={isSubmitting}
                        className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Common Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">公共属性 (应用于所有文件)</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="artist" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Musician / Composer (English)</label>
                <select id="artist" value={artist} onChange={handleArtistChange} disabled={isSubmitting || categoriesLoading} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100">
                  {musicians.map((m) => (<option key={m.id} value={m.en}>{m.en}</option>))}
                  <option value="__NEW__">Add New...</option>
                </select>
                {artist === '__NEW__' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="text" value={newArtist} onChange={(e) => setNewArtist(e.target.value)} placeholder="New Musician (EN)" disabled={isSubmitting} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
                    <div className="flex space-x-2">
                      <input type="text" id="artistZh" value={artistZh} onChange={(e) => setArtistZh(e.target.value)} placeholder="音乐家 (中文)" disabled={isSubmitting} className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
                      <button type="button" onClick={handleAddArtist} disabled={isSubmitting} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap">Add</button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="performer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Performer / 演奏者</label>
                <input type="text" id="performer" value={performer} onChange={(e) => setPerformer(e.target.value)} disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category (English)</label>
                <select id="category" value={category} onChange={handleCategoryChange} disabled={isSubmitting || categoriesLoading} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100">
                  {categories.map((cat) => (<option key={cat.id} value={cat.en}>{cat.en}</option>))}
                  <option value="__NEW__">Add New...</option>
                </select>
                {category === '__NEW__' && (
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category (EN)" disabled={isSubmitting} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
                    <div className="flex space-x-2">
                      <input type="text" value={categoryZh} onChange={(e) => setCategoryZh(e.target.value)} placeholder="新分类 (中文)" disabled={isSubmitting} className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
                      <button type="button" onClick={handleAddCategory} disabled={isSubmitting} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap">Add</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="series" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Series (English)</label>
                <select id="series" value={series} onChange={handleSeriesChange} disabled={isSubmitting || categoriesLoading} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100">
                  <option value="">None / Optional</option>
                  {seriesList.map((s) => (<option key={s.id} value={s.en}>{s.en}</option>))}
                  <option value="__NEW__">Add New...</option>
                </select>
                {series === '__NEW__' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="text" value={newSeries} onChange={(e) => setNewSeries(e.target.value)} placeholder="New Series (EN)" disabled={isSubmitting} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
                    <div className="flex space-x-2">
                      <input type="text" id="seriesZh" value={seriesZh} onChange={(e) => setSeriesZh(e.target.value)} placeholder="系列 (中文)" disabled={isSubmitting} className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100" />
                      <button type="button" onClick={handleAddSeries} disabled={isSubmitting} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap">Add</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={isSubmitting || files.length === 0} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? '正在提交...' : `提交 (${files.length} 个文件)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
