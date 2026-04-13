import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMedia, deleteMedia, API_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ImageIcon, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: media = [], isLoading, isError } = useQuery({
    queryKey: ["media"],
    queryFn: fetchMedia,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Media deleted", description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto px-4 py-20 max-w-7xl">
      <div className="mb-16 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">
          <ImageIcon className="h-3 w-3" />
          <span>Asset Repository</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4">
          Media <span className="text-cyan-500 italic">Intelligence Vault</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
          Manage your neural fingerprints and attribution metadata within our encrypted decentralized vault.
        </p>
      </div>

      {isLoading && <div className="text-center text-cyan-500 font-black uppercase tracking-widest py-32 animate-pulse">Synchronizing Vault...</div>}
      {isError && <div className="text-center text-red-500 font-bold py-32">Authentication Error: Failed to synchronize vault.</div>}

      {!isLoading && !isError && media.length === 0 && (
        <Card className="bg-[#030712]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] text-center py-24 shadow-2xl">
          <CardContent>
            <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mb-8">
              <ImageIcon className="h-8 w-8 text-slate-700" />
            </div>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">No assets detected in current sector.</p>
            <Button className="mt-8 bg-cyan-600 hover:bg-cyan-500 rounded-full px-8 text-[10px] font-black tracking-widest uppercase">Initiate Ingestion</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {media.map((item) => (
          <Card key={item.media_id} className="group bg-[#030712]/40 backdrop-blur-3xl border border-white/5 hover:border-cyan-500/30 transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1">
            <div className="relative aspect-square bg-slate-900 w-full overflow-hidden">
              <img
                src={`${API_URL}/media/${item.media_id}`}
                alt="Vault Asset"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </div>
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[10px] font-mono text-cyan-500 truncate tracking-tighter uppercase opacity-70">ID: {item.media_id}</CardTitle>
              {item.upload_time && (
                <div className="flex items-center text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2">
                  <Calendar className="h-3 w-3 mr-2" />
                  {new Date(item.upload_time).toLocaleDateString()}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-grow">
              <div className="flex flex-wrap gap-2 mt-2">
                {item.labels.slice(0, 2).map((label) => (
                  <Badge key={label} variant="outline" className="text-[9px] font-black tracking-widest uppercase border-white/5 bg-white/5 text-slate-400">
                    {label}
                  </Badge>
                ))}
                {item.labels.length > 2 && (
                  <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-cyan-500/20 text-cyan-500 bg-cyan-500/5">
                    +{item.labels.length - 2} SENSORS
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="destructive"
                size="sm"
                className="w-full h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest"
                onClick={() => {
                  if (confirm("Initiate asset purge? This action is irreversible.")) {
                    deleteMutation.mutate(item.media_id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Purge Asset
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
