import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, RefreshCw, Star, Image as ImageIcon, Trash2, Cloud } from 'lucide-react';
import { PropertyImage, UploadProgressItem } from '../../types';
import { uploadPropertyImage, validateImageFile } from '../../services/storageService';
import { getOptimizedImageUrl } from '../../lib/cloudinary';

interface ImageUploadModalProps {
  propertyId?: string;
  images?: PropertyImage[];
  onImagesUpdated?: (images: PropertyImage[]) => void;
  onUploadComplete?: (images: PropertyImage[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  propertyId = 'listing',
  images = [],
  onImagesUpdated,
  onUploadComplete,
  isOpen,
  onClose,
}) => {
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([]);
  const [currentImages, setCurrentImages] = useState<PropertyImage[]>(images);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if parent images change
  React.useEffect(() => {
    if (images && images.length > 0) {
      setCurrentImages(images);
    }
  }, [images]);

  if (!isOpen) return null;

  const notifyParent = (newImagesList: PropertyImage[], addedImagesOnly?: PropertyImage[]) => {
    setCurrentImages(newImagesList);
    if (onImagesUpdated) {
      onImagesUpdated(newImagesList);
    }
    if (onUploadComplete && addedImagesOnly && addedImagesOnly.length > 0) {
      onUploadComplete(addedImagesOnly);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadProgressItem[] = Array.from(files).map((file) => {
      const validation = validateImageFile(file);
      return {
        file,
        id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        progress: 0,
        status: validation.valid ? 'pending' : 'error',
        error: validation.error,
      };
    });

    setUploadQueue((prev) => [...prev, ...newItems]);

    // Start uploading valid pending items
    newItems.forEach((item, idx) => {
      if (item.status === 'pending') {
        startUpload(item, currentImages.length + idx);
      }
    });
  };

  const startUpload = async (item: UploadProgressItem, orderIdx: number) => {
    setUploadQueue((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 10 } : i))
    );

    try {
      const uploadedImg = await uploadPropertyImage(
        item.file,
        propertyId,
        (progress) => {
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          );
        },
        orderIdx
      );

      // Auto assign cover if no cover exists
      if (currentImages.length === 0) {
        uploadedImg.isCover = true;
      }

      setUploadQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'completed', progress: 100, downloadUrl: uploadedImg.url, storagePath: uploadedImg.publicId || uploadedImg.path }
            : i
        )
      );

      const updatedList = [...currentImages, uploadedImg];
      notifyParent(updatedList, [uploadedImg]);
    } catch (err: any) {
      console.error('[Cloudinary ImageUpload] Upload error:', err);
      setUploadQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'error', error: err.message || 'Upload failed. Please retry.' }
            : i
        )
      );
    }
  };

  const retryUpload = (item: UploadProgressItem) => {
    startUpload(item, currentImages.length);
  };

  const removeUploadQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((i) => i.id !== id));
  };

  const setCoverImage = (imageId: string) => {
    const updated = currentImages.map((img) => ({
      ...img,
      isCover: img.id === imageId,
    }));
    notifyParent(updated);
  };

  const removeImage = (imageId: string) => {
    const updated = currentImages.filter((img) => img.id !== imageId);
    if (updated.length > 0 && !updated.some((img) => img.isCover)) {
      updated[0].isCover = true;
    }
    notifyParent(updated);
  };

  const updateCaption = (imageId: string, caption: string) => {
    const updated = currentImages.map((img) =>
      img.id === imageId ? { ...img, caption } : img
    );
    notifyParent(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cloudinary Media Manager</h3>
              <p className="text-xs text-slate-500">Preset: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-semibold">chafique_properties</code> • Folder: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">chafique-property-agency/properties</code></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Drag & Drop Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Drag & drop property photos here, or <span className="text-emerald-600 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports JPEG, PNG, WEBP & AVIF (Auto-optimized via Cloudinary)
            </p>
          </div>

          {/* Active Uploads Queue */}
          {uploadQueue.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Upload Progress ({uploadQueue.filter((i) => i.status === 'completed').length}/{uploadQueue.length} done)</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Secure Cloudinary Sync</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate max-w-[60%]">
                      <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-700 truncate">{item.file.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status === 'uploading' && (
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-600 font-bold">{item.progress}%</span>
                        </div>
                      )}

                      {item.status === 'completed' && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Cloudinary Ready
                        </span>
                      )}

                      {item.status === 'error' && (
                        <div className="flex items-center gap-2">
                          <span className="text-rose-600 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-4 h-4" /> {item.error || 'Failed'}
                          </span>
                          <button
                            onClick={() => retryUpload(item)}
                            className="p-1 hover:bg-slate-200 text-emerald-600 rounded flex items-center gap-1 font-bold"
                            title="Retry Upload"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Retry
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => removeUploadQueueItem(item.id)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Property Gallery Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Property Gallery ({currentImages.length} photos)
              </h4>
              <span className="text-[11px] text-slate-400">Click star to set Primary Cover</span>
            </div>

            {currentImages.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs">
                No images added yet. Upload photos above to build the property gallery.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {currentImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative rounded-xl overflow-hidden border-2 group bg-slate-950 transition-all ${
                      img.isCover ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(img.url, { width: 400, height: 280, crop: 'fill' })}
                      alt={img.caption || img.alt || 'Property view'}
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Cover badge */}
                    {img.isCover && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-md shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Cover
                      </div>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end gap-1">
                        {!img.isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverImage(img.id)}
                            className="p-1.5 bg-white text-slate-800 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
                            title="Set as Cover photo"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="p-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shadow-xs cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={img.caption || ''}
                          onChange={(e) => updateCaption(img.id, e.target.value)}
                          placeholder="Photo caption..."
                          className="w-full text-[11px] bg-white/95 text-slate-900 px-2 py-1 rounded-md border border-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {currentImages.length} images ready in gallery
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Done & Save Gallery</span>
          </button>
        </div>
      </div>
    </div>
  );
};
