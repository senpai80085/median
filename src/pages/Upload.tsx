import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMedia, type UploadResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: uploadMedia,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Upload successful", description: `Media ID: ${data.media_id}` });
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 10 MB.", variant: "destructive" });
        return;
      }
      setResult(null);
      mutation.mutate(file);
    },
    [mutation, toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Media</h1>
        <p className="text-muted-foreground mt-1">
          Upload an image to extract labels and generate an embedding vector.
        </p>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/bmp" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ''; // Reset for sequential uploads of same file
        }} 
      />

      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          {mutation.isPending ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="font-medium">Analyzing image...</p>
              <p className="text-sm text-muted-foreground">Extracting labels and generating embedding</p>
            </>
          ) : (
            <>
              <UploadIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium">Drop an image here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports JPG, PNG, WebP, BMP, GIF · Max 10 MB
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="border-primary/30">
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Upload Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Media ID</p>
              <p className="font-mono text-sm">{result.media_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Detected Labels</p>
              <div className="flex flex-wrap gap-1">
                {result.labels.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setResult(null);
              }}
            >
              Upload Another
            </Button>
          </CardContent>
        </Card>
      )}

      {mutation.isError && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm">{mutation.error.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
