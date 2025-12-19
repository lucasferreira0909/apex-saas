import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, ArrowLeft, Copy, Check, Grid3X3, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Settings, ChevronDown, Sparkles, Image, Film, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedBio {
  bio: string;
  highlights: string[];
  cta: string;
}

export default function ProfileStructureGenerator() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [niche, setNiche] = useState("");
  const [valueProposition, setValueProposition] = useState("");
  const [tone, setTone] = useState("");
  const [generatedBio, setGeneratedBio] = useState<GeneratedBio | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Mock data for the Instagram preview
  const postsCount = "127";
  const followersCount = "12.5K";
  const followingCount = "892";

  const generateBio = async () => {
    if (!displayName.trim() || !niche.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e nicho.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-profile-structure', {
        body: { 
          businessName: displayName, 
          niche, 
          platform: "instagram", 
          valueProposition, 
          tone 
        }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setGeneratedBio({
        bio: data.bio,
        highlights: data.highlights || [],
        cta: data.cta || ""
      });
      
      toast({
        title: "Bio gerada!",
        description: "Sua bio está pronta. Veja o preview atualizado."
      });
    } catch (error) {
      console.error('Error generating bio:', error);
      toast({
        title: "Erro ao gerar bio",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyBio = async () => {
    if (!generatedBio) return;
    
    const bioText = `${generatedBio.bio}

${generatedBio.cta}`;

    await navigator.clipboard.writeText(bioText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado!",
      description: "Bio copiada para a área de transferência."
    });
  };

  // Display bio - use generated or show placeholder
  const displayBio = generatedBio?.bio || (niche ? `${niche} • Transformando ideias em resultados` : "Sua bio aparecerá aqui...");
  const displayCta = generatedBio?.cta || (valueProposition ? "👇 Saiba mais" : "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/tools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <UserCircle className="h-6 w-6 mr-2 text-[#e8e8e8]" />
            Estrutura de Perfil
          </h1>
          <p className="text-muted-foreground">Crie a estrutura ideal para o perfil do Instagram</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Perfil</CardTitle>
            <CardDescription>Preencha os dados para gerar sua bio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">@ Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                  placeholder="seunome"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de Exibição *</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Seu Nome ou Marca"
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Nicho de Atuação *</Label>
              <Input
                id="niche"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                placeholder="Ex: Marketing Digital, Fitness, Gastronomia..."
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueProposition">Proposta de Valor (opcional)</Label>
              <Textarea
                id="valueProposition"
                value={valueProposition}
                onChange={e => setValueProposition(e.target.value)}
                placeholder="O que torna você/seu negócio único? Qual transformação você oferece?"
                className="bg-input border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tom de Comunicação</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione o tom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="descontraido">Descontraído</SelectItem>
                  <SelectItem value="inspirador">Inspirador</SelectItem>
                  <SelectItem value="educativo">Educativo</SelectItem>
                  <SelectItem value="provocativo">Provocativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateBio} 
              disabled={isGenerating || !displayName.trim() || !niche.trim()} 
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Bio...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Bio com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Instagram Mockup Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prévia do Perfil</CardTitle>
                <CardDescription>Visualize como ficará seu perfil no Instagram</CardDescription>
              </div>
              {generatedBio && (
                <Button variant="outline" size="sm" onClick={copyBio}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar Bio
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Instagram Profile Mockup */}
            <div className="rounded-xl overflow-hidden border border-border bg-black max-w-[320px] mx-auto">
              {/* Status Bar */}
              <div className="bg-black px-4 py-2 flex items-center justify-between text-white text-xs">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 border border-white rounded-sm">
                    <div className="w-3/4 h-full bg-white rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Instagram Header */}
              <div className="bg-black px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold text-sm">
                    {username || "username"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 border-2 border-white rounded-md" />
                  <MoreHorizontal className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Profile Section */}
              <div className="bg-black px-4 py-4">
                {/* Profile Picture and Stats */}
                <div className="flex items-center gap-6 mb-4">
                  {/* Profile Picture */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 flex justify-around">
                    <div className="text-center">
                      <p className="text-white font-semibold text-lg">{postsCount}</p>
                      <p className="text-gray-400 text-xs">posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-lg">{followersCount}</p>
                      <p className="text-gray-400 text-xs">seguidores</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-lg">{followingCount}</p>
                      <p className="text-gray-400 text-xs">seguindo</p>
                    </div>
                  </div>
                </div>

                {/* Name and Bio */}
                <div className="mb-4">
                  <p className="text-white font-semibold text-sm mb-1">
                    {displayName || "Seu Nome"}
                  </p>
                  <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                    {displayBio}
                  </p>
                  {displayCta && (
                    <p className="text-blue-400 text-sm mt-1">{displayCta}</p>
                  )}
                </div>

                {/* Highlights */}
                {generatedBio?.highlights && generatedBio.highlights.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 mb-4">
                    {generatedBio.highlights.slice(0, 5).map((highlight, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-0.5">
                          <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                            <span className="text-2xl">
                              {['📌', '💡', '🎯', '⭐', '🚀'][i]}
                            </span>
                          </div>
                        </div>
                        <span className="text-white text-[10px] text-center max-w-[64px] truncate">
                          {highlight.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </div>
                    ))}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full border border-dashed border-gray-600 flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">+</span>
                      </div>
                      <span className="text-gray-500 text-[10px]">Novo</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button className="flex-1 bg-blue-500 text-white text-sm font-semibold py-1.5 rounded-lg">
                    Seguir
                  </button>
                  <button className="flex-1 bg-gray-800 text-white text-sm font-semibold py-1.5 rounded-lg">
                    Mensagem
                  </button>
                  <button className="bg-gray-800 text-white px-3 py-1.5 rounded-lg">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-t border-gray-800">
                  <button className="flex-1 py-3 flex justify-center border-b border-white">
                    <Grid3X3 className="h-5 w-5 text-white" />
                  </button>
                  <button className="flex-1 py-3 flex justify-center">
                    <Film className="h-5 w-5 text-gray-500" />
                  </button>
                  <button className="flex-1 py-3 flex justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Grid Preview */}
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-800 flex items-center justify-center">
                      <Image className="h-6 w-6 text-gray-600" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="bg-black border-t border-gray-800 px-6 py-3 flex justify-between">
                <div className="w-6 h-6 border-2 border-white" />
                <div className="w-6 h-6 text-gray-500">🔍</div>
                <div className="w-6 h-6 border border-gray-500 rounded" />
                <Heart className="h-6 w-6 text-gray-500" />
                <div className="w-6 h-6 rounded-full bg-gray-600" />
              </div>
            </div>

            {/* Tips */}
            {generatedBio && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">💡 Destaques Sugeridos</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {generatedBio.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>{highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
