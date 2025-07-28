import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrucoCard, TrucoCardData } from "./TrucoCard";
import { analyzeHand, suggestPlay, TrucoDecision } from "@/utils/trucoLogic";
import { 
  createAdvancedGameState, 
  getAdvancedDecision, 
  AdvancedGameState,
  TrucoLearningSystem,
  ProbabilityMatrix,
  TrucoProbabilityEngine
} from '@/utils/advancedTrucoAI';
import { Zap, Target, Brain, TrendingUp, BarChart3, Lightbulb, Shield } from "lucide-react";

interface TrucoAnalyzerProps {
  playerCards: TrucoCardData[];
  vira: TrucoCardData;
  opponentCard?: TrucoCardData;
  onPlayCard: (card: TrucoCardData) => void;
}

export const TrucoAnalyzer = ({ 
  playerCards, 
  vira, 
  opponentCard, 
  onPlayCard 
}: TrucoAnalyzerProps) => {
  const [decision, setDecision] = useState<TrucoDecision | null>(null);
  const [selectedCard, setSelectedCard] = useState<TrucoCardData | null>(null);
  const [handStrength, setHandStrength] = useState(0);
  const [probabilities, setProbabilities] = useState<ProbabilityMatrix | null>(null);
  const [gameState, setGameState] = useState<AdvancedGameState | null>(null);
  const [useAdvancedAI, setUseAdvancedAI] = useState(true);

  useEffect(() => {
    if (playerCards.length > 0) {
      const analysis = analyzeHand(playerCards, vira);
      setHandStrength(analysis.strength);
      
      if (useAdvancedAI) {
        // Usar sistema avançado de IA
        const advancedState = createAdvancedGameState(playerCards, vira, 'opponent_1');
        setGameState(advancedState);
        
        const advancedDecision = getAdvancedDecision(advancedState, opponentCard);
        setDecision(advancedDecision);
        setSelectedCard(advancedDecision.cardToPlay || null);
        
        // Calcular probabilidades
        const probs = TrucoProbabilityEngine.calculateWinProbability(
          playerCards, vira, advancedState.opponentProfile, advancedState
        );
        setProbabilities(probs);
      } else {
        // Usar sistema básico
        const suggestion = suggestPlay(playerCards, vira, opponentCard);
        setDecision(suggestion);
        setSelectedCard(suggestion.cardToPlay || null);
        setProbabilities(null);
      }
    }
  }, [playerCards, vira, opponentCard, useAdvancedAI]);

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return "text-green-500";
    if (strength >= 60) return "text-yellow-500";
    if (strength >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return "Excelente";
    if (strength >= 60) return "Boa";
    if (strength >= 40) return "Regular";
    return "Fraca";
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'truco': return <Zap className="w-4 h-4" />;
      case 'play': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'truco': return "bg-destructive text-destructive-foreground";
      case 'play': return "bg-primary text-primary-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Controle de IA */}
      <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Sistema de IA</span>
        </div>
        <Button
          variant={useAdvancedAI ? "default" : "outline"}
          size="sm"
          onClick={() => setUseAdvancedAI(!useAdvancedAI)}
        >
          {useAdvancedAI ? "Avançado" : "Básico"}
        </Button>
      </div>

      {/* Análise da mão */}
      <Card className="p-4 bg-gradient-to-r from-secondary to-muted border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Força da Mão</h3>
              <p className="text-sm text-muted-foreground">
                {getStrengthLabel(handStrength)} ({Math.round(handStrength)}%)
              </p>
            </div>
          </div>
          <div className={`text-2xl font-bold ${getStrengthColor(handStrength)}`}>
            {Math.round(handStrength)}%
          </div>
        </div>
      </Card>

      {/* Análise Probabilística Avançada */}
      {useAdvancedAI && probabilities && (
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-foreground">Análise Probabilística</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Chance de Vitória:</span>
                  <span className="font-medium text-green-500">
                    {Math.round(probabilities.winProbability * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Probabilidade Truco:</span>
                  <span className="font-medium text-destructive">
                    {Math.round(probabilities.trucoProbability * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risco de Blefe:</span>
                  <span className="font-medium text-orange-500">
                    {Math.round(probabilities.bluffProbability * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cartas Restantes:</span>
                  <span className="font-medium text-muted-foreground">
                    {Object.values(probabilities.cardDistribution).reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Perfil do Oponente */}
      {useAdvancedAI && gameState && (
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-foreground">Perfil do Oponente</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Agressividade</p>
                <p className="font-medium text-destructive">
                  {Math.round(gameState.opponentProfile.aggressiveness)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Frequência Blefe</p>
                <p className="font-medium text-orange-500">
                  {Math.round(gameState.opponentProfile.bluffFrequency)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Taxa de Vitória</p>
                <p className="font-medium text-green-500">
                  {Math.round(gameState.opponentProfile.winRate * 100)}%
                </p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Jogos analisados: {gameState.opponentProfile.totalGames}
            </div>
          </div>
        </Card>
      )}

      {/* Carta vira */}
      <Card className="p-4 bg-gradient-to-br from-gold/10 to-gold/5 border-gold/30">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-foreground">Vira</h3>
          <div className="flex justify-center">
            <TrucoCard card={vira} />
          </div>
          <p className="text-xs text-muted-foreground">
            Manilha: próxima carta da sequência
          </p>
        </div>
      </Card>

      {/* Suas cartas */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Suas Cartas</h3>
        <div className="flex gap-2 justify-center">
          {playerCards.map((card, index) => (
            <TrucoCard
              key={`${card.suit}-${card.value}-${index}`}
              card={card}
              isHighlighted={selectedCard?.suit === card.suit && selectedCard?.value === card.value}
              onClick={() => onPlayCard(card)}
              className="cursor-pointer hover:scale-105"
            />
          ))}
        </div>
      </div>

      {/* Carta do oponente */}
      {opponentCard && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Carta do Oponente</h3>
          <div className="flex justify-center">
            <TrucoCard card={opponentCard} />
          </div>
        </div>
      )}

      {/* Sugestão de jogada */}
      {decision && (
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Sugestão</h3>
              <Badge className={getActionColor(decision.action)}>
                {getActionIcon(decision.action)}
                <span className="ml-1 capitalize">{decision.action}</span>
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confiança:</span>
                <span className="font-medium text-foreground">{decision.confidence}%</span>
              </div>
              
              <p className="text-sm text-foreground bg-background/50 p-3 rounded-lg">
                {decision.reasoning}
              </p>
            </div>

            {decision.cardToPlay && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Carta sugerida:</span>
                <TrucoCard 
                  card={decision.cardToPlay} 
                  className="w-12 h-16"
                />
              </div>
            )}

            {decision.action === 'truco' && (
              <Button 
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={() => {/* Implementar lógica de truco */}}
              >
                <Zap className="w-4 h-4 mr-2" />
                TRUCO!
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};