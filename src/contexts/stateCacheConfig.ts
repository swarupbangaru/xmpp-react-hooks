import { createContext } from 'react';

export interface StateCacheConfig {
  enabled: boolean;
  namespace: string;
  silence: boolean;
  strict: boolean;
}

export default createContext<StateCacheConfig>({
  enabled: true,
  namespace: '',
  silence: false,
  strict: false
});
