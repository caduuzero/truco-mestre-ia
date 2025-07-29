import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, CameraOff, Target, Scan, Activity, Monitor, Upload } from 'lucide-react';
import { realCardDetector, DetectedCard, GameArea } from '@/utils/realCardDetection';
import { toast } from '@/hooks/use-toast';

interface CardScannerProps {
  onCardsDetected: (cards: any[]) => void;
}

const CardScanner: React.FC<CardScannerProps> = ({ onCardsDetected }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isScreenCapture, setIsScreenCapture] = useState(false);
  const [detectedCards, setDetectedCards] = useState<DetectedCard[]>([]);
  const [gameArea, setGameArea] = useState<GameArea | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'idle' | 'analyzing' | 'detecting' | 'processing' | 'complete'>('idle');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCameraScanning = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setIsScreenCapture(false);
        
        // Inicializar modelos de IA
        await initializeAI();
        
        // Iniciar detecção real
        startRealDetection();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: "Erro na Câmera",
        description: "Não foi possível acessar a câmera. Tente captura de tela.",
        variant: "destructive"
      });
    }
  };

  const startScreenCapture = async () => {
    try {
      setIsModelLoading(true);
      toast({
        title: "Captura de Tela",
        description: "Selecione a janela/tela do jogo de truco..."
      });

      const stream = await realCardDetector.captureScreen();
      
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setIsScreenCapture(true);
        
        // Inicializar modelos de IA
        await initializeAI();
        
        // Iniciar detecção real
        startRealDetection();
        
        toast({
          title: "Captura Iniciada",
          description: "Analisando tela do jogo em tempo real...",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erro na captura de tela:', error);
      toast({
        title: "Erro na Captura",
        description: "Não foi possível capturar a tela. Permissão negada?",
        variant: "destructive"
      });
    } finally {
      setIsModelLoading(false);
    }
  };

  const initializeAI = async () => {
    setIsModelLoading(true);
    setScanPhase('analyzing');
    
    try {
      await realCardDetector.initialize();
      toast({
        title: "IA Carregada",
        description: "Modelos de visão computacional prontos!",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao carregar IA:', error);
      toast({
        title: "Erro na IA",
        description: "Falha ao carregar modelos. Funcionalidade limitada.",
        variant: "destructive"
      });
    } finally {
      setIsModelLoading(false);
    }
  };

  const startRealDetection = () => {
    if (!videoRef.current) return;

    // Detectar cartas a cada 2 segundos
    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          setScanPhase('detecting');
          setScanProgress(30);
          
          const gameArea = await realCardDetector.processGameFrame(videoRef.current);
          
          setScanPhase('processing');
          setScanProgress(70);
          
          setGameArea(gameArea);
          setDetectedCards([...gameArea.playerHand, gameArea.vira, gameArea.opponentCard].filter(Boolean) as DetectedCard[]);
          
          setScanPhase('complete');
          setScanProgress(100);
          
          // Notificar cartas detectadas
          if (gameArea.playerHand.length > 0) {
            onCardsDetected(gameArea.playerHand.map(card => ({
              naipe: card.naipe,
              valor: card.valor
            })));
          }
          
          // Reset progress after 1 second
          setTimeout(() => {
            setScanProgress(0);
            setScanPhase('idle');
          }, 1000);
          
        } catch (error) {
          console.error('Erro na detecção:', error);
          setScanPhase('idle');
          setScanProgress(0);
        }
      }
    }, 2000);
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsScanning(false);
    setIsScreenCapture(false);
    setDetectedCards([]);
    setGameArea(null);
    setScanProgress(0);
    setScanPhase('idle');
    
    toast({
      title: "Scanner Parado",
      description: "Detecção de cartas interrompida.",
      variant: "default"
    });
  };

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Scanner de Cartas com IA Real</h2>
        <p className="text-muted-foreground">
          Captura de tela ou câmera + análise com modelos de IA para detecção real de cartas
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {!isScanning ? (
          <>
            <Button
              onClick={startCameraScanning}
              className="px-6"
              variant="default"
              disabled={isModelLoading}
            >
              <Camera className="mr-2 h-4 w-4" />
              Câmera
            </Button>
            <Button
              onClick={startScreenCapture}
              className="px-6"
              variant="outline"
              disabled={isModelLoading}
            >
              <Monitor className="mr-2 h-4 w-4" />
              Capturar Tela
            </Button>
          </>
        ) : (
          <Button
            onClick={stopScanning}
            className="px-8"
            variant="destructive"
          >
            <CameraOff className="mr-2 h-4 w-4" />
            Parar Scanner
          </Button>
        )}
      </div>
      
      {isModelLoading && (
        <div className="text-center mb-4">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-primary rounded-full"></div>
          <p className="text-sm text-muted-foreground mt-2">Carregando modelos de IA...</p>
        </div>
      )}

      {/* Área de vídeo */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-96 object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 flex items-center justify-center rounded-lg">
            <div className="text-center text-gray-500">
              <Camera className="mx-auto h-12 w-12 mb-2" />
              <p>Aguardando inicialização...</p>
            </div>
          </div>
        )}

        {/* Overlay de detecção */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid de auxílio */}
            <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
            </div>
            
            {/* Caixas de detecção das cartas */}
            {detectedCards.map((card, index) => (
              <div
                key={index}
                className="absolute border-2 border-green-400 bg-green-400/20 rounded"
                style={{
                  left: `${card.position.x}px`,
                  top: `${card.position.y}px`,
                  width: `${card.position.width}px`,
                  height: `${card.position.height}px`,
                }}
              >
                <div className="bg-green-400 text-black text-xs px-1 rounded-tl">
                  {card.valor} {card.naipe} ({Math.round(card.confidence * 100)}%)
                </div>
              </div>
            ))}
            
            {/* Indicador central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className={`w-4 h-4 rounded-full border-2 ${
                detectedCards.length > 0 ? 'border-green-400 bg-green-400/50' : 'border-white bg-white/20'
              } animate-pulse`} />
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Painel de Status */}
      {isScanning && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {isScreenCapture ? 'Captura de Tela' : 'Scanner Câmera'}
                </span>
              </div>
              <Badge variant="secondary" className="animate-pulse">
                {scanPhase === 'analyzing' && 'Analisando...'}
                {scanPhase === 'detecting' && 'Detectando...'}
                {scanPhase === 'processing' && 'Processando...'}
                {scanPhase === 'complete' && 'Completo!'}
                {scanPhase === 'idle' && 'Aguardando...'}
              </Badge>
            </div>

            <Progress value={scanProgress} className="mb-4" />

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{detectedCards.length}</p>
                <p className="text-xs text-muted-foreground">Cartas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {detectedCards.length > 0 ? Math.round(detectedCards.reduce((acc, card) => acc + card.confidence, 0) / detectedCards.length * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Confiança</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {scanPhase !== 'idle' ? '🔴' : '⚪'} {isScreenCapture ? 'SCREEN' : 'CAM'}
                </p>
                <p className="text-xs text-muted-foreground">Fonte</p>
              </div>
            </div>

            {/* Análise do Jogo */}
            {gameArea && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mão do Jogador:</span>
                  <Badge variant="outline">{gameArea.playerHand.length} cartas</Badge>
                </div>
                
                {gameArea.vira && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vira:</span>
                    <Badge variant="secondary">
                      {gameArea.vira.valor} de {gameArea.vira.naipe} ({Math.round(gameArea.vira.confidence * 100)}%)
                    </Badge>
                  </div>
                )}
                
                {gameArea.opponentCard && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Carta Oponente:</span>
                    <Badge variant="destructive">
                      {gameArea.opponentCard.valor} de {gameArea.opponentCard.naipe} ({Math.round(gameArea.opponentCard.confidence * 100)}%)
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Lista de cartas detectadas */}
            {detectedCards.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Cartas Detectadas:</h4>
                {detectedCards.map((card, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">
                      {card.valor} de {card.naipe}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(card.confidence * 100)}%
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        ({Math.round(card.position.x)}, {Math.round(card.position.y)})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CardScanner;