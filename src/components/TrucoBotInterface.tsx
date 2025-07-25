import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrucoAnalyzer } from './TrucoAnalyzer';
import { TrucoCardData } from './TrucoCard';
import { AppMode, OperationMode } from './AppModeSelector';
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
  Monitor
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
  const [vira] = useState<TrucoCardData>({
    suit: 'hearts',
    value: '7',
    trucoValue: 0
  });

  // Simula detecção de cartas em tempo real
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Simula detecção de cartas
      const mockCards: TrucoCardData[] = [
        { suit: 'clubs', value: 'A', trucoValue: 8 },
        { suit: 'hearts', value: 'K', trucoValue: 7 },
        { suit: 'spades', value: '3', trucoValue: 10 }
      ];
      
      setDetectedCards(mockCards);
      setConfidence(Math.random() * 30 + 70); // 70-100%
      setGameState('ready');
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggleBot = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setGameState('analyzing');
    } else {
      setGameState('waiting');
      setDetectedCards([]);
      setConfidence(0);
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

                <Button 
                  onClick={handleToggleBot}
                  className="w-full"
                  variant={isActive ? "destructive" : "default"}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Parar Bot
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Bot
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