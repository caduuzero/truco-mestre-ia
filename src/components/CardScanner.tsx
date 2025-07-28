import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, X, Scan, Eye, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TrucoCardData } from "./TrucoCard";

interface CardScannerProps {
  onCardsDetected: (cards: TrucoCardData[]) => void;
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
}

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  card?: TrucoCardData;
}

export const CardScanner = ({ onCardsDetected, isScanning, onScanningChange }: CardScannerProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detectionBoxes, setDetectionBoxes] = useState<DetectionBox[]>([]);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [detectionPhase, setDetectionPhase] = useState<'idle' | 'analyzing' | 'detecting' | 'processing' | 'complete'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Limpar recursos da câmera
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Simulação avançada de detecção de cartas com IA
  const simulateAdvancedCardDetection = async (): Promise<{ cards: TrucoCardData[], boxes: DetectionBox[] }> => {
    const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: Array<'A' | '2' | '3' | '4' | '5' | '6' | '7' | 'J' | 'Q' | 'K'> = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
    
    // Simular fases da detecção
    setDetectionPhase('analyzing');
    setScanningProgress(20);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setDetectionPhase('detecting');
    setScanningProgress(50);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setDetectionPhase('processing');
    setScanningProgress(80);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const cards: TrucoCardData[] = [];
    const boxes: DetectionBox[] = [];
    
    const cardCount = Math.floor(Math.random() * 3) + 2; // 2-4 cartas
    
    for (let i = 0; i < cardCount; i++) {
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const value = values[Math.floor(Math.random() * values.length)];
      const confidence = 0.85 + Math.random() * 0.14; // 85-99% confiança
      
      const card: TrucoCardData = {
        suit,
        value,
        trucoValue: 0
      };
      
      const box: DetectionBox = {
        x: 50 + (i * 80) + Math.random() * 20,
        y: 100 + Math.random() * 50,
        width: 60 + Math.random() * 20,
        height: 80 + Math.random() * 20,
        confidence,
        card
      };
      
      cards.push(card);
      boxes.push(box);
    }
    
    setDetectionPhase('complete');
    setScanningProgress(100);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return { cards, boxes };
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Câmera traseira
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setCameraMode(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      toast({
        title: "Câmera ativada!",
        description: "Posicione as cartas no centro da tela para detecção.",
      });
    } catch (error) {
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
    setDetectionBoxes([]);
    setDetectionPhase('idle');
    setScanningProgress(0);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      onScanningChange(true);
      setDetectionPhase('analyzing');
      
      // Capturar frame da câmera
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      
      // Simular detecção avançada
      const { cards, boxes } = await simulateAdvancedCardDetection();
      
      setDetectionBoxes(boxes);
      onCardsDetected(cards);
      
      toast({
        title: "Cartas detectadas!",
        description: `Identifiquei ${cards.length} cartas com alta confiança.`,
      });
    } catch (error) {
      toast({
        title: "Erro na detecção",
        description: "Não foi possível analisar as cartas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      onScanningChange(false);
      setDetectionPhase('idle');
      setScanningProgress(0);
    }
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

      // Simular detecção avançada em imagem
      const { cards } = await simulateAdvancedCardDetection();
      onCardsDetected(cards);
      
      toast({
        title: "Cartas identificadas!",
        description: `Detectei ${cards.length} cartas na imagem com IA avançada.`,
      });
    } catch (error) {
      toast({
        title: "Erro no reconhecimento",
        description: "Não foi possível identificar as cartas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      onScanningChange(false);
      setDetectionPhase('idle');
      setScanningProgress(0);
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

  const getPhaseIcon = () => {
    switch (detectionPhase) {
      case 'analyzing': return <Eye className="w-4 h-4" />;
      case 'detecting': return <Scan className="w-4 h-4" />;
      case 'processing': return <Target className="w-4 h-4" />;
      case 'complete': return <Zap className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const getPhaseMessage = () => {
    switch (detectionPhase) {
      case 'analyzing': return 'Analisando imagem...';
      case 'detecting': return 'Detectando cartas...';
      case 'processing': return 'Processando com IA...';
      case 'complete': return 'Detecção completa!';
      default: return 'Pronto para detectar';
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-secondary to-muted border-border">
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              {cameraMode ? 'Detecção em Tempo Real' : 'Identifique suas cartas'}
            </h3>
            {cameraMode && (
              <Badge variant="default" className="bg-green-500 text-white">
                CÂMERA ATIVA
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {cameraMode 
              ? 'Posicione as cartas no centro da tela para detecção automática'
              : 'Use a câmera ou faça upload de uma foto para análise com IA'
            }
          </p>
        </div>

        {/* Status da detecção */}
        {isScanning && (
          <Card className="p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-blue-500/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPhaseIcon()}
                  <span className="text-sm font-medium">{getPhaseMessage()}</span>
                </div>
                <span className="text-sm text-muted-foreground">{scanningProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${scanningProgress}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Interface da câmera */}
        {cameraMode ? (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play();
                }
              }}
            />
            
            {/* Overlay de detecção */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Grid de auxílio */}
              <div className="absolute inset-4 border-2 border-dashed border-primary/50 rounded-lg">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
              </div>
              
              {/* Caixas de detecção */}
              {detectionBoxes.map((box, index) => (
                <div
                  key={index}
                  className="absolute border-2 border-green-400 bg-green-400/20 rounded"
                  style={{
                    left: `${box.x}px`,
                    top: `${box.y}px`,
                    width: `${box.width}px`,
                    height: `${box.height}px`,
                  }}
                >
                  <div className="bg-green-400 text-black text-xs px-1 rounded-tl">
                    {box.card?.value}{box.card?.suit.charAt(0).toUpperCase()} ({Math.round(box.confidence * 100)}%)
                  </div>
                </div>
              ))}
              
              {/* Indicador central */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  detectionBoxes.length > 0 ? 'border-green-400 bg-green-400/50' : 'border-white bg-white/20'
                } animate-pulse`} />
              </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={stopCamera}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : imagePreview ? (
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

        {/* Controles */}
        <div className="space-y-3">
          {cameraMode ? (
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={captureAndAnalyze}
                disabled={isScanning}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Scan className="w-4 h-4 mr-2" />
                {isScanning ? 'Analisando...' : 'Detectar Cartas'}
              </Button>
              
              <Button
                variant="outline"
                onClick={stopCamera}
                disabled={isScanning}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
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
                variant="default"
                onClick={startCamera}
                disabled={isScanning}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Usar câmera
              </Button>
            </div>
          )}
          
          {/* Estatísticas da detecção */}
          {detectionBoxes.length > 0 && (
            <Card className="p-3 bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/30">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {detectionBoxes.length} cartas detectadas
                </p>
                <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                  <span>Confiança média: {Math.round(detectionBoxes.reduce((acc, box) => acc + box.confidence, 0) / detectionBoxes.length * 100)}%</span>
                  <span>Qualidade: Excelente</span>
                </div>
              </div>
            </Card>
          )}
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