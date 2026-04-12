import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMedia, type UploadResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, CheckCircle2, XCircle, Loader2, Sparkles, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const analysisSteps = [
  "Extracting features...",
  "Comparing embeddings...",
  "Generating analysis...",
];

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      // Simulate analysis steps
      const stepInterval = setInterval(() => {
        setAnalysisStep((prev) => (prev + 1) % analysisSteps.length);
      }, 800);
      
      const result = await uploadMedia(file);
      clearInterval(stepInterval);
      return result;
    },
    onSuccess: (data) => {
      setResult(data);
      setAnalysisStep(0);
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Upload successful", description: `Media ID: ${data.media_id}` });
    },
    onError: (error: Error) => {
      setAnalysisStep(0);
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-4">
            <FileImage className="h-4 w-4 text-primary" />
            <span>Media Upload</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Upload <span className="gradient-text">Media</span>
          </h1>
          <p className="text-muted-foreground">
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
            e.target.value = '';
          }} 
        />

        {/* Drop zone */}
        <Card
          className={`glass border-2 border-dashed transition-all duration-300 cursor-pointer animate-fade-in-up animate-delay-100 ${
            dragActive ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-white/10 hover:border-primary/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            {mutation.isPending ? (
              <div className="space-y-6 w-full max-w-xs">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-2">Analyzing with AI...</p>
                  <p className="text-sm text-primary animate-pulse">{analysisSteps[analysisStep]}</p>
                </div>
                <Progress value={(analysisStep + 1) * 33} className="h-2" />
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                  <UploadIcon className="h-10 w-10 text-primary" />
                </div>
                <p className="font-semibold text-lg mb-2">Drop an image here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, WebP, BMP, GIF up to 10 MB
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="glass border-primary/30 mt-6 animate-fade-in-up hover-glow">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Upload Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Media ID</p>
                <p className="font-mono text-sm bg-primary/10 px-3 py-2 rounded-lg">{result.media_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Detected Labels</p>
                <div className="flex flex-wrap gap-2">
                  {result.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-white/20 hover:bg-white/5"
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
          <Card className="glass border-destructive/50 mt-6 animate-fade-in-up">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-sm">{mutation.error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
