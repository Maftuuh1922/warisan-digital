/**
 * Enhanced ML Features Component
 * Adds similarity search and explainability visualization to AI Analysis
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Lightbulb, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface SimilarItem {
  item_id: string;
  similarity: number;
  name?: string;
  artisan?: string;
}

interface ExplainabilityData {
  heatmap_base64: string;
  important_features: Array<{
    index: number;
    type: string;
    value: number;
    importance: number;
  }>;
  analysis: {
    summary: string;
    color_analysis: string;
    texture_analysis: string;
    geometry_analysis: string;
    recommendation: string;
  };
}

interface MLEnhancedFeaturesProps {
  image: File | null;
}

export function MLEnhancedFeatures({ image }: MLEnhancedFeaturesProps) {
  const [loading, setLoading] = useState(false);
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [explainability, setExplainability] = useState<ExplainabilityData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('similarity');

  const handleSimilaritySearch = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('top_k', '5');

      const result = await api<{ similar_items: SimilarItem[] }>('/api/batik/similarity', {
        method: 'POST',
        headers: { 'Content-Type': undefined as any },
        body: formData,
      });

      setSimilarItems(result.similar_items);
      toast.success('Pencarian pola serupa berhasil!');
    } catch (error) {
      console.error('Similarity search failed:', error);
      toast.error('Gagal mencari pola serupa');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainability = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);

      const result = await api<ExplainabilityData>('/api/batik/explain', {
        method: 'POST',
        headers: { 'Content-Type': undefined as any },
        body: formData,
      });

      setExplainability(result);
      toast.success('Analisis explainability berhasil!');
    } catch (error) {
      console.error('Explainability failed:', error);
      toast.error('Gagal membuat analisis explainability');
    } finally {
      setLoading(false);
    }
  };

  if (!image) return null;

  return (
    <Card className="mt-6 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-brand-accent" />
          Fitur ML Lanjutan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="similarity" className="gap-2">
              <Search className="h-4 w-4" />
              Pencarian Serupa
            </TabsTrigger>
            <TabsTrigger value="explainability" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Explainability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="similarity" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Temukan pola batik yang mirip dengan gambar Anda menggunakan analisis fitur visual.
            </p>
            
            <Button 
              onClick={handleSimilaritySearch} 
              disabled={loading}
              className="w-full"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Mencari...' : 'Cari Pola Serupa'}
            </Button>

            {similarItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h4 className="font-semibold text-sm">Hasil Pencarian:</h4>
                {similarItems.map((item, idx) => (
                  <Card key={item.item_id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {item.name || `Batik #${item.item_id}`}
                        </p>
                        {item.artisan && (
                          <p className="text-sm text-muted-foreground">
                            By {item.artisan}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {(item.similarity * 100).toFixed(1)}% match
                      </Badge>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="explainability" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Lihat visualisasi area pola yang dianalisis oleh model dan fitur-fitur penting.
            </p>
            
            <Button 
              onClick={handleExplainability} 
              disabled={loading}
              className="w-full"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {loading ? 'Menganalisis...' : 'Tampilkan Analisis'}
            </Button>

            {explainability && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Heatmap */}
                <div className="rounded-lg overflow-hidden border">
                  <img 
                    src={`data:image/png;base64,${explainability.heatmap_base64}`}
                    alt="Pattern Focus Heatmap"
                    className="w-full"
                  />
                  <div className="p-3 bg-muted">
                    <p className="text-xs text-muted-foreground">
                      Area merah/kuning menunjukkan fokus utama model dalam mengidentifikasi pola
                    </p>
                  </div>
                </div>

                {/* Analysis Summary */}
                <Card className="p-4 bg-muted">
                  <h4 className="font-semibold mb-2">Ringkasan Analisis</h4>
                  <p className="text-sm">{explainability.analysis.summary}</p>
                </Card>

                {/* Feature Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Detail Fitur:</h4>
                  
                  <Card className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Warna</p>
                        <p className="text-xs text-muted-foreground">
                          {explainability.analysis.color_analysis}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Tekstur</p>
                        <p className="text-xs text-muted-foreground">
                          {explainability.analysis.texture_analysis}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Geometri</p>
                        <p className="text-xs text-muted-foreground">
                          {explainability.analysis.geometry_analysis}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Top Features */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">Fitur Terpenting:</h4>
                  <div className="space-y-2">
                    {explainability.important_features.slice(0, 5).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {feat.type}
                        </Badge>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-accent"
                            style={{ width: `${(feat.importance / explainability.important_features[0].importance) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {feat.importance.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recommendation */}
                <Card className="p-4 bg-brand-accent/10 border-brand-accent/20">
                  <p className="text-sm">
                    💡 <strong>Rekomendasi:</strong> {explainability.analysis.recommendation}
                  </p>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
