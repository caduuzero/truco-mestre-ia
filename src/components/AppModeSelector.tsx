import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, Eye, Bot, Zap, Settings2, Hand } from 'lucide-react';

export type AppMode = 'mobile' | 'desktop' | 'manual';
export type OperationMode = 'assistant' | 'automatic';

interface AppModeSelectorProps {
  onModeSelect: (appMode: AppMode, operationMode: OperationMode) => void;
}

export const AppModeSelector = ({ onModeSelect }: AppModeSelectorProps) => {
  const [selectedAppMode, setSelectedAppMode] = useState<AppMode | null>(null);

  const handleOperationModeSelect = (operationMode: OperationMode) => {
    if (selectedAppMode) {
      onModeSelect(selectedAppMode, operationMode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-baize to-baize-dark flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            🃏 <span className="bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">
              Truco Bot Pro
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Sistema avançado de assistência e automação para Truco Paulista
          </p>
        </div>

        {!selectedAppMode ? (
          /* App Mode Selection */
          <div className="grid md:grid-cols-3 gap-6">
            <Card 
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
              onClick={() => setSelectedAppMode('mobile')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Smartphone className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-2xl">Versão Mobile</CardTitle>
                <CardDescription>
                  App Android com overlay em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm">Overlay sobreposto ao jogo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm">Reconhecimento em tempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Controles flutuantes</span>
                  </div>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Ideal para jogar diretamente no celular
                </Badge>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
              onClick={() => setSelectedAppMode('desktop')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Monitor className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-2xl">Versão Desktop</CardTitle>
                <CardDescription>
                  Conexão via ADB com processamento no PC
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm">Captura via ADB/USB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm">Processamento OpenCV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Automação completa</span>
                  </div>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Máximo desempenho e controle
                </Badge>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:border-gold hover:shadow-lg"
              onClick={() => onModeSelect('manual', 'assistant')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Hand className="w-16 h-16 text-gold" />
                </div>
                <CardTitle className="text-2xl">Modo Manual</CardTitle>
                <CardDescription>
                  Simulador de partida com seleção manual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gold" />
                    <span className="text-sm">Escolha cartas manualmente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gold" />
                    <span className="text-sm">Sistema de manilhas automático</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-gold" />
                    <span className="text-sm">Simulação de partida completa</span>
                  </div>
                </div>
                <Badge variant="outline" className="w-full justify-center border-gold text-gold">
                  Ideal para treino e aprendizado
                </Badge>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Operation Mode Selection */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Modo de Operação
              </h2>
              <p className="text-muted-foreground">
                Escolha como o sistema deve atuar durante o jogo
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                onClick={() => handleOperationModeSelect('assistant')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    <Eye className="w-16 h-16 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">Modo Assistente</CardTitle>
                  <CardDescription>
                    Analisa e sugere as melhores jogadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p>• Reconhece cartas automaticamente</p>
                    <p>• Calcula probabilidades de vitória</p>
                    <p>• Sugere estratégias otimizadas</p>
                    <p>• Você mantém controle total</p>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    Recomendado para aprendizado
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-all hover:border-destructive hover:shadow-lg"
                onClick={() => handleOperationModeSelect('automatic')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    <Bot className="w-16 h-16 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">Modo Automático</CardTitle>
                  <CardDescription>
                    Joga automaticamente por você
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p>• Execução automática completa</p>
                    <p>• Estratégias avançadas de IA</p>
                    <p>• Adaptação ao estilo dos oponentes</p>
                    <p>• Performance otimizada</p>
                  </div>
                  <Badge variant="destructive" className="w-full justify-center">
                    Máxima automação
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setSelectedAppMode(null)}
                className="mt-4"
              >
                Voltar à seleção de versão
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};