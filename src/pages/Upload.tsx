import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMedia, type UploadResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, CheckCircle2, XCircle, Loader2, Sparkles, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

import { useNavigate } from "react-router-dom";

const analysisSteps = [
  "Extracting features...",
  "Comparing embeddings...",
  "Generating analysis...",
];

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [results, setResults] = useState<UploadResponse[]>([]);
  const [analysisStep, setAnalysisStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Simulate analysis steps
      const stepInterval = setInterval(() => {
        setAnalysisStep((prev) => (prev + 1) % analysisSteps.length);
      }, 800);
      
      const uploadPromises = files.map(file => uploadMedia(file));
      const res = await Promise.all(uploadPromises);
      
      clearInterval(stepInterval);
      return res;
    },
    onSuccess: (data) => {
      setResults(data);
      setAnalysisStep(0);
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Upload successful", description: `Uploaded ${data.length} media items.` });
    },
    onError: (error: Error) => {
      setAnalysisStep(0);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast({ title: "Invalid file", description: `${file.name} is not an image file. It was skipped.`, variant: "destructive" });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: "File too large", description: `${file.name} exceeds 10 MB. It was skipped.`, variant: "destructive" });
          continue;
        }
        validFiles.push(file);
      }
      
      if (validFiles.length === 0) return;
      
      setResults([]);
      mutation.mutate(validFiles);
    },
    [mutation, toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-6">
            <Sparkles className="h-3 w-3" />
            <span>Secure Ingestion Portal</span>
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">
            Ingest <span className="text-cyan-500 italic">Media Asset</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Submit content for structural fingerprinting and multimodal attribution analysis.
          </p>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
            e.target.value = '';
          }} 
        />

        {/* Drop zone */}
        <Card
          className={`bg-[#030712]/40 backdrop-blur-3xl border-2 border-dashed transition-all duration-500 cursor-pointer animate-fade-in-up animate-delay-100 rounded-[2.5rem] ${
            dragActive ? "border-cyan-500 bg-cyan-500/5 shadow-2xl shadow-cyan-500/10" : "border-white/5 hover:border-cyan-500/40"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            {mutation.isPending ? (
              <div className="space-y-8 w-full max-w-xs">
                <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                  <Loader2 className="h-12 w-12 text-white animate-spin" />
                </div>
                <div>
                  <p className="font-black text-xs uppercase tracking-[0.2em] mb-3 text-cyan-500">Processing Neural Mesh</p>
                  <p className="text-sm text-slate-300 italic font-medium">"{analysisSteps[analysisStep]}"</p>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(analysisStep + 1) * 33}%` }} />
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mb-8 group-hover:bg-cyan-500/10 transition-colors">
                  <UploadIcon className="h-10 w-10 text-cyan-500" />
                </div>
                <p className="font-bold text-lg mb-2 text-white">Drop assets here or click to browse</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                  High-Resolution JPG, PNG, WebP supported
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {results.length > 0 && (
          <Card className="glass border-primary/30 mt-6 animate-fade-in-up hover-glow">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Upload Complete ({results.length} files)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="default"
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/dashboard");
                  }}
                >
                  View in Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResults([]);
                  }}
                >
                  Upload More
                </Button>
              </div>
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
