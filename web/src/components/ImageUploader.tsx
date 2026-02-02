import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as adminApi from '../services/adminApi';
import { getImageUrl } from '../utils/imageUtils';

interface ImageUploaderProps {
    currentImage?: string;
    onUpload: (url: string) => void;
    uploadType?: string;
    label?: string;
    placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    currentImage,
    onUpload,
    uploadType = 'products',
    label = 'Product Image',
    placeholder = 'Click to upload or drag and drop an image'
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update preview when currentImage changes (from parent)
    useEffect(() => {
        if (currentImage) {
            setPreviewUrl(getImageUrl(currentImage));
        } else {
            setPreviewUrl(null);
        }
    }, [currentImage]);

    const handleFile = useCallback(async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        setIsUploading(true);

        // Create local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        try {
            const uploadedUrl = await adminApi.uploadImage(file, uploadType);
            // The uploadedUrl is relative (/uploads/...), we need to resolve it for preview if we weren't using the local blob
            // But since we have the local blob, we can keep showing it or update to the resolved URL.
            // Let's update to the resolved URL to ensure it works from the server.
            setPreviewUrl(getImageUrl(uploadedUrl));
            onUpload(uploadedUrl);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            // Revert to original image if upload fails
            setPreviewUrl(currentImage ? getImageUrl(currentImage) : null);
        } finally {
            setIsUploading(false);
            // Clean up the local preview URL
            URL.revokeObjectURL(localPreview);
        }
    }, [uploadType, onUpload, currentImage]);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewUrl(null);
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}

            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                    transition-all duration-200 min-h-[150px] flex items-center justify-center
                    ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
                    }
                    ${isUploading ? 'opacity-70 pointer-events-none' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-slate-500">Uploading...</span>
                    </div>
                ) : previewUrl ? (
                    <div className="relative group">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-32 max-w-full object-contain rounded-md"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-sm">{placeholder}</span>
                        <span className="text-xs text-slate-400">PNG, JPG, GIF, WebP up to 5MB</span>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};

export default ImageUploader;
