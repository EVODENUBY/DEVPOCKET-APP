import Constants from 'expo-constants';
import { apiBaseUrl } from '../api/health';

function resolveRuntimeVersion(): string | null {
  const value = Constants.expoConfig?.runtimeVersion;
  return typeof value === 'string' ? value : null;
}

export const appInfo = {
  version: Constants.expoConfig?.version ?? '0.1.0',
  androidVersionCode: Constants.expoConfig?.android?.versionCode ?? null,
  expoSdkVersion: Constants.expoConfig?.sdkVersion ?? null,
  runtimeVersion: resolveRuntimeVersion(),
  apiUrl: apiBaseUrl,
} as const;
