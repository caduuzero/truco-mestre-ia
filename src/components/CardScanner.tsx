import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TrucoCardData } from "./TrucoCard";

interface CardScannerProps {
  onCardsDetected: (cards: TrucoCardData[]) => void;
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
}

export const CardScanner = ({ onCardsDetected, isScanning, onScanningChange }: CardScannerProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Simulação de reconhecimento de cartas (implementação real requereria AI/ML)
  const mockCardRecognition = (): TrucoCardData[] => {
    const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: Array<'A' | '2' | '3' | '4' | '5' | '6' | '7' | 'J' | 'Q' | 'K'> = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
    
    const randomCards: TrucoCardData[] = [];
    for (let i = 0; i < 3; i++) {
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const value = values[Math.floor(Math.random() * values.length)];
      randomCards.push({
        suit,
        value,
        trucoValue: 0 // Será calculado pela lógica do truco
      });
    }
    return randomCards;
  };

  const processImage = async (file: File) => {
    try {
      onScanningChange(true);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simular processamento de AI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const detectedCards = mockCardRecognition();
      onCardsDetected(detectedCards);
      
      toast({
        title: "Cartas identificadas!",
        description: `Detectei ${detectedCards.length} cartas na imagem.`,
      });
    } catch (error) {
      toast({
        title: "Erro no reconhecimento",
        description: "Não foi possível identificar as cartas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      onScanningChange(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      processImage(file);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-secondary to-muted border-border">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Identifique suas cartas
          </h3>
          <p className="text-sm text-muted-foreground">
            Faça upload de uma foto das suas cartas para análise automática
          </p>
        </div>

        {imagePreview ? (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview das cartas" 
              className="w-full h-48 object-cover rounded-lg border-2 border-border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}
              ${isScanning ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-3">
              <div className="flex justify-center">
                {isScanning ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                ) : (
                  <Upload className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-foreground font-medium">
                  {isScanning ? 'Analisando cartas...' : 'Clique ou arraste uma imagem'}
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG até 10MB
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Escolher arquivo
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              // Em uma implementação real, abriria a câmera
              toast({
                title: "Em desenvolvimento",
                description: "Funcionalidade de câmera em breve!",
              });
            }}
            disabled={isScanning}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Usar câmera
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </Card>
  );
};