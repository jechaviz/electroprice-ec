// Google Identity Services helper: obtains a Google ID token in the browser so
// the app can authenticate against the PocketBase-independent V backend
// (POST /pb/api/electroprice/auth/google) instead of PocketBase's OAuth flow.

let gisLoader: Promise<void> | null = null;

const loadGis = (): Promise<void> => {
  if (gisLoader) return gisLoader;
  gisLoader = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisLoader = null;
      reject(new Error('No se pudo cargar Google Identity Services.'));
    };
    document.head.appendChild(script);
  });
  return gisLoader;
};

/** Resolves with a Google ID token (JWT) for the configured OAuth client. */
export const requestGoogleCredential = async (clientId: string): Promise<string> => {
  await loadGis();
  const google = (window as any).google;
  if (!google?.accounts?.id) {
    throw new Error('Google Identity Services no está disponible.');
  }
  return new Promise<string>((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (response?.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('No se recibió credencial de Google.'));
        }
      },
    });
    google.accounts.id.prompt((notification: any) => {
      if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
        reject(new Error('El inicio de sesión con Google fue cancelado.'));
      }
    });
  });
};
