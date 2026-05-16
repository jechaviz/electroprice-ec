let sanitizeModulePromise: Promise<typeof import('./sanitize')> | null = null;

const loadSanitizeModule = () => {
  sanitizeModulePromise ??= import('./sanitize');
  return sanitizeModulePromise;
};

export const sanitizeInputAsync = async (input: string): Promise<string> => {
  const { sanitizeInput } = await loadSanitizeModule();
  return sanitizeInput(input);
};

export const preloadSanitize = () => {
  void loadSanitizeModule();
};
