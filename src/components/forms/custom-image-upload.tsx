"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageIcon, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CustomImageUploadProps {
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function CustomImageUpload({
  onFileSelect,
  currentFile,
  disabled = false,
}: CustomImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create preview URL when file changes
  useEffect(() => {
    if (!currentFile) {
      setPreviewUrl(null);
      return;
    }
    
    const url = URL.createObjectURL(currentFile);
    setPreviewUrl(url);
    
    return () => URL.revokeObjectURL(url);
  }, [currentFile]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format non supporté. Utilisez JPG, PNG ou WebP.";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `Fichier trop volumineux. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }
    
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    onFileSelect(null);
    setError(null);
  }, [onFileSelect]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Image personnalisée (optionnel)
      </Label>
      
      {previewUrl ? (
        // Preview mode
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border bg-muted">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="w-full h-full object-contain"
            />
          </div>
          
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
          
          <div className="mt-2 text-xs text-muted-foreground">
            {currentFile?.name} ({(currentFile?.size || 0 / 1024).toFixed(0)} KB)
          </div>
        </div>
      ) : (
        // Upload mode
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-colors",
            isDragging && "border-primary bg-primary/5",
            !isDragging && "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileInput}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10">
              {isDragging ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragging ? "Déposez l'image ici" : "Cliquez ou glissez une image"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WebP • Max {MAX_FILE_SIZE / 1024 / 1024}MB
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Téléversez une image de l'article ou du style que vous souhaitez pour votre projet
      </p>
    </div>
  );
}

// Made with Bob
