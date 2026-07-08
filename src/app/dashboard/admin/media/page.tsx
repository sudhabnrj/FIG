'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch } from '../../../../hooks/store';
import { showToast } from '../../../../features/ui/uiSlice';

export default function AdminMediaPage() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/media');
      const json = await res.json();
      if (json.success) {
        setMedia(json.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('File uploaded successfully!'));
        fetchMedia();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Upload failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error uploading file'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file from storage?')) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('File deleted successfully'));
        fetchMedia();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Deletion failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/media/sync', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast(`Sync complete! Flagged ${json.flaggedCount} files as unused.`));
        fetchMedia();
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error syncing assets'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Media Library Catalog</h1>
          <p className="text-xs text-text-muted mt-1">Review system storage allocations, sweep unused attachments, and manage file assets.</p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={handleSync} disabled={syncing} className="px-3.5 py-2 border border-border-custom bg-cardBg hover:bg-border-light text-text-secondary text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-55">
            <i className={syncing ? 'fas fa-spinner fa-spin' : 'fas fa-sync'}></i> {syncing ? 'Sweeping...' : 'Sweep Unused Assets'}
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg shadow-md border-0 cursor-pointer transition-all disabled:opacity-55"
          >
            {uploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>} Upload File
          </button>
        </div>
      </div>

      {/* Grid of items */}
      {loading ? (
        <div className="flex h-48 items-center justify-center bg-cardBg border border-border-custom rounded-xl shadow-card">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : media.length === 0 ? (
        <div className="p-12 text-center text-text-muted bg-cardBg border border-border-custom rounded-xl shadow-card">
          <i className="fas fa-images text-4xl mb-3 text-primary/30"></i>
          <p className="text-sm font-semibold">No media files uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((file) => {
            const isImg = file.mimetype.startsWith('image/');
            const sizeKB = (file.size / 1024).toFixed(1);
            return (
              <div key={file._id} className="bg-cardBg border border-border-custom rounded-xl overflow-hidden shadow-card flex flex-col group relative">
                {/* Media Preview Box */}
                <div className="h-28 bg-body flex items-center justify-center overflow-hidden border-b border-border-custom relative">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.url} alt={file.filename} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  ) : (
                    <i className="fas fa-file-pdf text-4xl text-red-500"></i>
                  )}

                  {/* Absolute indicator for usage */}
                  <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    file.isUsed 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    {file.isUsed ? 'Used' : 'Unused'}
                  </span>
                </div>

                {/* Details */}
                <div className="p-3 space-y-1 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-xs text-text-primary truncate" title={file.filename}>{file.filename}</p>
                    <p className="text-[10px] text-text-muted">{sizeKB} KB</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border-custom mt-2">
                    <a href={file.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary font-bold hover:underline" title="View source">
                      Open URL
                    </a>
                    <button onClick={() => handleDelete(file._id)} className="text-red-500 hover:bg-red-500/10 p-1 rounded bg-transparent border-0 cursor-pointer text-xs" title="Delete file">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
