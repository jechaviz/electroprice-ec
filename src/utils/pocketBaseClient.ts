import type PocketBase from 'pocketbase';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

let pocketBaseInstance: PocketBase | null = null;
let pocketBasePromise: Promise<PocketBase> | null = null;

export const loadPocketBase = async (): Promise<PocketBase> => {
  if (pocketBaseInstance) {
    return pocketBaseInstance;
  }

  if (!pocketBasePromise) {
    pocketBasePromise = import('pocketbase')
      .then(({ default: PocketBaseClient }) => {
        pocketBaseInstance = new PocketBaseClient(pbUrl);
        pocketBaseInstance.autoCancellation(false);
        return pocketBaseInstance;
      })
      .catch((error) => {
        pocketBasePromise = null;
        throw error;
      });
  }

  return pocketBasePromise;
};

export const getLoadedPocketBase = (): PocketBase | null => pocketBaseInstance;
