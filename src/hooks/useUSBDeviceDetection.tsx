import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface USBDevice {
  deviceId: string;
  deviceName: string;
  vendorId: number;
  productId: number;
}

interface ADBDevice {
  id: string;
  model: string;
  deviceName: string;
  androidVersion: string;
  isConnected: boolean;
}

export const useUSBDeviceDetection = () => {
  const [usbDevices, setUSBDevices] = useState<USBDevice[]>([]);
  const [adbDevices, setADBDevices] = useState<ADBDevice[]>([]);
  const [isCheckingADB, setIsCheckingADB] = useState(false);
  const [hasConnectedDevice, setHasConnectedDevice] = useState(false);

  // Detectar dispositivos USB conectados
  const detectUSBDevices = async () => {
    try {
      if ('usb' in navigator) {
        const devices = await (navigator as any).usb.getDevices();
        const usbDeviceList: USBDevice[] = devices.map((device: any) => ({
          deviceId: device.serialNumber || `${device.vendorId}_${device.productId}`,
          deviceName: device.productName || 'Dispositivo USB Desconhecido',
          vendorId: device.vendorId,
          productId: device.productId
        }));
        
        setUSBDevices(usbDeviceList);
        
        // Verificar se há dispositivos Android conectados (IDs de vendor comuns)
        const androidVendors = [0x18d1, 0x22b8, 0x0bb4, 0x12d1, 0x19d2, 0x04e8, 0x0fce];
        const hasAndroidDevice = usbDeviceList.some(device => 
          androidVendors.includes(device.vendorId)
        );
        
        if (hasAndroidDevice) {
          await checkADBDevices();
        }
        
        return usbDeviceList;
      } else {
        console.warn('WebUSB não suportado neste navegador');
        // Fallback: simular checagem ADB diretamente
        await checkADBDevices();
        return [];
      }
    } catch (error) {
      console.error('Erro ao detectar dispositivos USB:', error);
      return [];
    }
  };

  // Verificar dispositivos ADB (simulação de comando adb devices)
  const checkADBDevices = async () => {
    setIsCheckingADB(true);
    
    try {
      // Em um ambiente real, isso seria uma chamada para um service worker 
      // ou uma extensão do navegador que pode executar comandos ADB
      
      // Por enquanto, vamos simular a detecção baseada em algumas verificações
      const isADBAvailable = await simulateADBCheck();
      
      if (isADBAvailable) {
        // Simular dispositivo detectado
        const mockDevice: ADBDevice = {
          id: 'emulator-5554',
          model: 'Android Device',
          deviceName: 'Dispositivo Android Conectado',
          androidVersion: '11',
          isConnected: true
        };
        
        setADBDevices([mockDevice]);
        setHasConnectedDevice(true);
        
        toast({
          title: "Dispositivo Android Detectado!",
          description: `${mockDevice.deviceName} conectado via USB`,
          variant: "default"
        });
      } else {
        setADBDevices([]);
        setHasConnectedDevice(false);
      }
      
    } catch (error) {
      console.error('Erro na verificação ADB:', error);
      setADBDevices([]);
      setHasConnectedDevice(false);
    } finally {
      setIsCheckingADB(false);
    }
  };

  // Simular verificação de ADB (em produção, seria uma verificação real)
  const simulateADBCheck = async (): Promise<boolean> => {
    // Verificar se há permissões de USB
    if ('usb' in navigator) {
      try {
        const devices = await (navigator as any).usb.getDevices();
        return devices.length > 0;
      } catch (error) {
        return false;
      }
    }
    
    // Verificar se há elementos que indicam um ambiente de desenvolvimento
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname.includes('192.168') ||
                         window.location.hostname.includes('127.0.0.1');
    
    return isDevelopment;
  };

  // Solicitar permissão para acessar dispositivo USB específico
  const requestUSBDevice = async () => {
    try {
      if ('usb' in navigator) {
        const device = await (navigator as any).usb.requestDevice({
          filters: [
            // Filtros para dispositivos Android comuns
            { vendorId: 0x18d1 }, // Google
            { vendorId: 0x04e8 }, // Samsung
            { vendorId: 0x22b8 }, // Motorola
            { vendorId: 0x0bb4 }, // HTC
            { vendorId: 0x12d1 }, // Huawei
            { vendorId: 0x19d2 }, // ZTE
            { vendorId: 0x0fce }, // Sony Ericsson
          ]
        });
        
        if (device) {
          await detectUSBDevices();
          toast({
            title: "Dispositivo USB Conectado",
            description: `${device.productName || 'Dispositivo Android'} autorizado`,
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar dispositivo USB:', error);
      toast({
        title: "Erro na Conexão USB",
        description: "Não foi possível conectar ao dispositivo USB",
        variant: "destructive"
      });
    }
  };

  // Monitorar mudanças nos dispositivos USB
  useEffect(() => {
    const handleUSBConnect = (event: any) => {
      console.log('Dispositivo USB conectado:', event.device);
      detectUSBDevices();
    };

    const handleUSBDisconnect = (event: any) => {
      console.log('Dispositivo USB desconectado:', event.device);
      detectUSBDevices();
    };

    if ('usb' in navigator) {
      (navigator as any).usb.addEventListener('connect', handleUSBConnect);
      (navigator as any).usb.addEventListener('disconnect', handleUSBDisconnect);
    }

    // Verificação inicial
    detectUSBDevices();

    return () => {
      if ('usb' in navigator) {
        (navigator as any).usb.removeEventListener('connect', handleUSBConnect);
        (navigator as any).usb.removeEventListener('disconnect', handleUSBDisconnect);
      }
    };
  }, []);

  return {
    usbDevices,
    adbDevices,
    hasConnectedDevice,
    isCheckingADB,
    detectUSBDevices,
    checkADBDevices,
    requestUSBDevice
  };
};