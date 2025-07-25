import { useState } from 'react';
import { AppModeSelector, AppMode, OperationMode } from '@/components/AppModeSelector';
import { TrucoBotInterface } from '@/components/TrucoBotInterface';

const Index = () => {
  const [currentView, setCurrentView] = useState<'selector' | 'bot'>('selector');
  const [selectedAppMode, setSelectedAppMode] = useState<AppMode>('mobile');
  const [selectedOperationMode, setSelectedOperationMode] = useState<OperationMode>('assistant');

  const handleModeSelect = (appMode: AppMode, operationMode: OperationMode) => {
    setSelectedAppMode(appMode);
    setSelectedOperationMode(operationMode);
    setCurrentView('bot');
  };

  const handleBack = () => {
    setCurrentView('selector');
  };

  if (currentView === 'selector') {
    return <AppModeSelector onModeSelect={handleModeSelect} />;
  }

  return (
    <TrucoBotInterface 
      appMode={selectedAppMode}
      operationMode={selectedOperationMode}
      onBack={handleBack}
    />
  );
};

export default Index;
