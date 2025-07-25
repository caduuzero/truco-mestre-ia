import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1894f32d2c834878aa54cc15dc48436f',
  appName: 'truco-mestre-ia',
  webDir: 'dist',
  server: {
    url: "https://1894f32d-2c83-4878-aa54-cc15dc48436f.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;