import { useState } from 'react';
import { CardScanner } from "@/components/CardScanner";
import { TrucoAnalyzer } from "@/components/TrucoAnalyzer";
import { TrucoCard, TrucoCardData } from "@/components/TrucoCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, RotateCcw } from "lucide-react";

const Index = () => {
  const [playerCards, setPlayerCards] = useState<TrucoCardData[]>([]);
  const [vira, setVira] = useState<TrucoCardData>({
    suit: 'hearts',
    value: '7',
    trucoValue: 0
  });
  const [opponentCard, setOpponentCard] = useState<TrucoCardData | undefined>();
  const [isScanning, setIsScanning] = useState(false);

  const handleCardsDetected = (cards: TrucoCardData[]) => {
    setPlayerCards(cards);
  };

  const handlePlayCard = (card: TrucoCardData) => {
    // Remove a carta jogada das cartas do jogador
    setPlayerCards(prev => prev.filter(c => !(c.suit === card.suit && c.value === card.value)));
  };

  const generateRandomVira = () => {
    const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: Array<'A' | '2' | '3' | '4' | '5' | '6' | '7' | 'J' | 'Q' | 'K'> = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
    
    setVira({
      suit: suits[Math.floor(Math.random() * suits.length)],
      value: values[Math.floor(Math.random() * values.length)],
      trucoValue: 0
    });
  };

  const simulateOpponentPlay = () => {
    const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: Array<'A' | '2' | '3' | '4' | '5' | '6' | '7' | 'J' | 'Q' | 'K'> = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
    
    setOpponentCard({
      suit: suits[Math.floor(Math.random() * suits.length)],
      value: values[Math.floor(Math.random() * values.length)],
      trucoValue: 0
    });
  };

  const resetGame = () => {
    setPlayerCards([]);
    setOpponentCard(undefined);
    generateRandomVira();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-baize to-baize-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            🃏 <span className="bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">
              Truco Mestre IA
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Identifique suas cartas e receba sugestões estratégicas de um mestre do truco!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Lado esquerdo - Scanner e controles */}
          <div className="space-y-6">
            <CardScanner 
              onCardsDetected={handleCardsDetected}
              isScanning={isScanning}
              onScanningChange={setIsScanning}
            />
            
            {/* Controles do jogo */}
            <Card className="p-4 bg-secondary/50 border-border">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Controles do Jogo</h3>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={generateRandomVira}
                    className="flex-1"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Nova Vira
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={simulateOpponentPlay}
                    className="flex-1"
                  >
                    Oponente Joga
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={resetGame}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Status */}
            {playerCards.length === 0 && !isScanning && (
              <Card className="p-6 bg-muted/30 border-dashed border-2 border-border">
                <div className="text-center text-muted-foreground">
                  <p className="font-medium mb-2">Aguardando cartas...</p>
                  <p className="text-sm">
                    Faça upload de uma imagem das suas cartas para começar a análise
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Lado direito - Análise */}
          <div className="space-y-6">
            {playerCards.length > 0 && (
              <TrucoAnalyzer
                playerCards={playerCards}
                vira={vira}
                opponentCard={opponentCard}
                onPlayCard={handlePlayCard}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Desenvolvido com IA para auxiliar suas decisões no truco. 
            <br />
            <span className="text-xs">Reconhecimento de cartas em desenvolvimento - versão demo com cartas simuladas</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
