import { useState } from 'react';
import { AppModeSelector, AppMode, OperationMode } from '@/components/AppModeSelector';
import { TrucoBotInterface } from '@/components/TrucoBotInterface';
import { TrucoManualMode } from '@/components/TrucoManualMode';

const Index = () => {
  const [currentView, setCurrentView] = useState<'selector' | 'bot' | 'manual'>('selector');
  const [selectedAppMode, setSelectedAppMode] = useState<AppMode>('mobile');
  const [selectedOperationMode, setSelectedOperationMode] = useState<OperationMode>('assistant');

  const handleModeSelect = (appMode: AppMode, operationMode: OperationMode) => {
    setSelectedAppMode(appMode);
    setSelectedOperationMode(operationMode);
    if (appMode === 'manual') {
      setCurrentView('manual');
    } else {
      setCurrentView('bot');
    }
  };

  const handleBack = () => {
    setCurrentView('selector');
  };

  if (currentView === 'selector') {
    return <AppModeSelector onModeSelect={handleModeSelect} />;
  }

  if (currentView === 'manual') {
    return <TrucoManualMode onBack={handleBack} />;
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
