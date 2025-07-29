import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrucoAnalyzer } from './TrucoAnalyzer';
import { TrucoCardData } from './TrucoCard';
import { AppMode, OperationMode } from './AppModeSelector';
import { useUSBDeviceDetection } from '@/hooks/useUSBDeviceDetection';
import { androidScreenCapture } from '@/utils/androidScreenCapture';
import { realCardDetector } from '@/utils/realCardDetection';
import { toast } from '@/hooks/use-toast';
import { 
  Eye, 
  Bot, 
  Activity, 
  Brain, 
  Target, 
  Settings, 
  Play, 
  Pause,
  ArrowLeft,
  Smartphone,
  Monitor,
  Usb,
  AlertTriangle
} from 'lucide-react';

interface TrucoBotInterfaceProps {
  appMode: AppMode;
  operationMode: OperationMode;
  onBack: () => void;
}

export const TrucoBotInterface = ({ appMode, operationMode, onBack }: TrucoBotInterfaceProps) => {
  const [isActive, setIsActive] = useState(false);
  const [detectedCards, setDetectedCards] = useState<TrucoCardData[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [gameState, setGameState] = useState<'analyzing' | 'ready' | 'playing' | 'waiting'>('waiting');
  const [isRealDetection, setIsRealDetection] = useState(false);
  const [vira] = useState<TrucoCardData>({
    suit: 'hearts',
    value: '7',
    trucoValue: 0
  });

  // Hook para detecção de dispositivos USB/ADB
  const {
    usbDevices,
    adbDevices,
    hasConnectedDevice,
    isCheckingADB,
    detectUSBDevices,
    requestUSBDevice
  } = useUSBDeviceDetection();

  // Sistema de detecção real de cartas
  useEffect(() => {
    if (!isActive || !hasConnectedDevice) return;

    const startRealDetection = async () => {
      try {
        setGameState('analyzing');
        
        if (appMode === 'desktop' && adbDevices.length > 0) {
          // Conectar ao dispositivo Android via ADB simulado
          const device = adbDevices[0];
          const connected = await androidScreenCapture.connect(device.id);
          
          if (connected) {
            setIsRealDetection(true);
            
            // Inicializar modelos de IA
            await realCardDetector.initialize();
            
            // Iniciar captura contínua
            androidScreenCapture.startContinuousCapture(async (imageData) => {
              try {
                // Converter ImageData para elementos de análise
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  canvas.width = imageData.width;
                  canvas.height = imageData.height;
                  ctx.putImageData(imageData, 0, 0);
                  
                  // Simular análise (no real seria processamento da tela do jogo)
                  const gameArea = await realCardDetector.processGameFrame(canvas as any);
                  
                  if (gameArea.playerHand.length > 0) {
                    const trucoCards: TrucoCardData[] = gameArea.playerHand.map(card => {
                      // Converter naipe para formato inglês
                      const suitMap: { [key: string]: 'hearts' | 'diamonds' | 'clubs' | 'spades' } = {
                        'copas': 'hearts',
                        'ouros': 'diamonds', 
                        'espadas': 'spades',
                        'paus': 'clubs'
                      };
                      
                      // Converter valor numérico para string
                      const valueMap: { [key: number]: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | 'J' | 'Q' | 'K' } = {
                        1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 
                        11: 'J', 12: 'Q', 13: 'K'
                      };
                      
                      return {
                        suit: suitMap[card.naipe] || 'hearts',
                        value: valueMap[card.valor] || '7',
                        trucoValue: calculateTrucoValue(valueMap[card.valor] || '7', suitMap[card.naipe] || 'hearts')
                      };
                    });
                    
                    setDetectedCards(trucoCards);
                    setConfidence(gameArea.playerHand.reduce((acc, card) => acc + card.confidence, 0) / gameArea.playerHand.length * 100);
                    setGameState('ready');
                  }
                }
              } catch (error) {
                console.error('Erro na análise da captura:', error);
              }
            }, 3000);
            
            toast({
              title: "Detecção Real Ativada",
              description: "Analisando tela do dispositivo em tempo real",
              variant: "default"
            });
          }
        } else {
          // Fallback para modo simulado se não há dispositivo
          setIsRealDetection(false);
          setTimeout(() => {
            const mockCards: TrucoCardData[] = [
              { suit: 'clubs', value: 'A', trucoValue: 8 },
              { suit: 'hearts', value: 'K', trucoValue: 7 },
              { suit: 'spades', value: '3', trucoValue: 10 }
            ];
            
            setDetectedCards(mockCards);
            setConfidence(85);
            setGameState('ready');
          }, 2000);
        }
      } catch (error) {
        console.error('Erro na inicialização da detecção:', error);
        setGameState('waiting');
      }
    };

    startRealDetection();

    return () => {
      androidScreenCapture.disconnect();
      setIsRealDetection(false);
    };
  }, [isActive, hasConnectedDevice, adbDevices, appMode]);

  // Função para calcular valor no Truco
  const calculateTrucoValue = (valor: string, naipe: string): number => {
    const valueMap: { [key: string]: number } = {
      '4': 1, '5': 2, '6': 3, '7': 4, 'Q': 5, 'J': 6, 'K': 7, 'A': 8, '2': 9, '3': 10
    };
    return valueMap[valor] || 0;
  };

  const handleToggleBot = () => {
    if (!hasConnectedDevice && appMode === 'desktop') {
      toast({
        title: "Dispositivo Não Conectado",
        description: "Conecte um dispositivo Android via USB para usar o modo Desktop",
        variant: "destructive"
      });
      return;
    }

    setIsActive(!isActive);
    if (!isActive) {
      setGameState('analyzing');
    } else {
      setGameState('waiting');
      setDetectedCards([]);
      setConfidence(0);
      androidScreenCapture.disconnect();
      setIsRealDetection(false);
    }
  };

  const handlePlayCard = (card: TrucoCardData) => {
    if (operationMode === 'automatic') {
      // Em modo automático, executa automaticamente
      console.log('Bot executando jogada:', card);
    } else {
      // Em modo assistente, apenas sugere
      console.log('Sugestão de jogada:', card);
    }
    
    // Remove carta jogada
    setDetectedCards(prev => prev.filter(c => 
      !(c.suit === card.suit && c.value === card.value)
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-baize to-baize-dark">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {appMode === 'mobile' ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              <span className="text-sm font-medium">
                {appMode === 'mobile' ? 'Mobile' : 'Desktop'}
              </span>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              {operationMode === 'assistant' ? <Eye className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              <span className="text-sm font-medium">
                {operationMode === 'assistant' ? 'Assistente' : 'Automático'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Painel de Controle */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status do Bot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado:</span>
                  <Badge variant={
                    gameState === 'ready' ? 'default' : 
                    gameState === 'analyzing' ? 'secondary' : 
                    gameState === 'playing' ? 'destructive' : 'outline'
                  }>
                    {gameState === 'ready' ? 'Pronto' : 
                     gameState === 'analyzing' ? 'Analisando' : 
                     gameState === 'playing' ? 'Jogando' : 'Aguardando'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confiança:</span>
                    <span className="text-sm font-medium">{Math.round(confidence)}%</span>
                  </div>
                  <Progress value={confidence} className="h-2" />
                </div>

                {/* Status do Dispositivo */}
                {appMode === 'desktop' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dispositivo USB:</span>
                      <Badge variant={hasConnectedDevice ? 'default' : 'destructive'}>
                        {hasConnectedDevice ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                    
                    {!hasConnectedDevice && (
                      <Button 
                        onClick={requestUSBDevice}
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        disabled={isCheckingADB}
                      >
                        <Usb className="w-4 h-4 mr-2" />
                        {isCheckingADB ? 'Verificando...' : 'Conectar Dispositivo'}
                      </Button>
                    )}
                    
                    {adbDevices.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {adbDevices[0].deviceName} • {adbDevices[0].model}
                      </div>
                    )}
                    
                    {isRealDetection && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Detecção Real Ativa
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleToggleBot}
                  className="w-full"
                  variant={isActive ? "destructive" : "default"}
                  disabled={appMode === 'desktop' && !hasConnectedDevice}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Parar Bot
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {appMode === 'desktop' && !hasConnectedDevice ? 'Dispositivo Necessário' : 'Iniciar Bot'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Configurações do Modo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appMode === 'mobile' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Overlay Mobile</h4>
                    <p className="text-xs text-muted-foreground">
                      Interface sobreposta ao jogo Cacheta League
                    </p>
                  </div>
                )}
                
                {appMode === 'desktop' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Conexão ADB</h4>
                    <p className="text-xs text-muted-foreground">
                      Captura de tela via cabo USB
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    {operationMode === 'assistant' ? 'Modo Assistente' : 'Modo Automático'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {operationMode === 'assistant' 
                      ? 'Análise e sugestões em tempo real'
                      : 'Execução automática de jogadas'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Aprendizagem */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Sistema de Aprendizagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Jogos analisados:</span>
                  <Badge variant="outline">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Precisão:</span>
                  <Badge variant="outline">--</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  O bot evoluirá conforme recebe mais dados e feedback
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Área Principal */}
          <div className="lg:col-span-2 space-y-6">
            {!isActive ? (
              <Card className="p-8">
                <div className="text-center space-y-4">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-semibold">Sistema Inativo</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Clique em "Iniciar Bot" para começar o reconhecimento {appMode === 'mobile' ? 'via overlay' : 'via ADB'} 
                    e análise em tempo real das cartas.
                  </p>
                </div>
              </Card>
            ) : detectedCards.length > 0 ? (
              <TrucoAnalyzer
                playerCards={detectedCards}
                vira={vira}
                onPlayCard={handlePlayCard}
              />
            ) : (
              <Card className="p-8">
                <div className="text-center space-y-4">
                  <div className="animate-pulse">
                    <Eye className="w-16 h-16 text-primary mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold">Detectando Cartas...</h3>
                  <p className="text-muted-foreground">
                    {appMode === 'mobile' 
                      ? 'Analisando tela do jogo via overlay...'
                      : 'Capturando tela via ADB e processando com OpenCV...'
                    }
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};