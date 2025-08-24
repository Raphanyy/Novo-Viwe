/**
 * Testes para configuração do Mapbox
 */

import { mapboxConfig } from './mapbox-config';

// Token padrão fornecido pelo administrador
const DEFAULT_TOKEN = 'pk.eyJ1IjoicmFwaGFueSIsImEiOiJjbWVuOTBpcDMwdnBxMmlweGp0cmc4a2s0In0.KwsjXFJmloQvThFvFGjOdA';

describe('Mapbox Configuration', () => {
  beforeEach(() => {
    // Reset configuration before each test
    mapboxConfig.reset();
  });

  test('should validate default token correctly', () => {
    // Mock environment variable
    const originalEnv = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = DEFAULT_TOKEN;

    const config = mapboxConfig.getConfig();
    
    expect(config.isValid).toBe(true);
    expect(config.isAvailable).toBe(true);
    expect(config.token).toBe(DEFAULT_TOKEN);
    expect(config.errorMessage).toBeNull();

    // Restore environment
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = originalEnv;
  });

  test('should use default token when no environment variable is set', () => {
    // Mock empty environment
    const originalEnv = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    delete import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    const config = mapboxConfig.getConfig();
    
    expect(config.isValid).toBe(true);
    expect(config.isAvailable).toBe(true);
    expect(config.token).toBe(DEFAULT_TOKEN);

    // Restore environment
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = originalEnv;
  });

  test('should reject invalid token formats', () => {
    const invalidTokens = [
      '', // empty
      'invalid', // no pk. prefix
      'pk.', // too short
      'pk.invalid-chars!@#', // invalid characters
      'sk.validformat', // wrong prefix (secret key)
    ];

    invalidTokens.forEach(token => {
      const originalEnv = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = token;

      const config = mapboxConfig.getConfig();
      
      expect(config.isValid).toBe(false);
      expect(config.isAvailable).toBe(false);
      expect(config.token).toBeNull();
      expect(config.errorMessage).toContain('inválido');

      // Restore environment
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = originalEnv;
      mapboxConfig.reset();
    });
  });

  test('should handle token with JWT format correctly', () => {
    // JWT tokens have dots as separators
    const jwtToken = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example-signature-with-dots.and-more';
    
    const originalEnv = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = jwtToken;

    const config = mapboxConfig.getConfig();
    
    expect(config.isValid).toBe(true);
    expect(config.isAvailable).toBe(true);
    expect(config.token).toBe(jwtToken);

    // Restore environment
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = originalEnv;
  });

  test('should provide API URL creation', () => {
    const config = mapboxConfig.getConfig();
    
    if (config.isAvailable) {
      const url = mapboxConfig.createApiUrl('https://api.mapbox.com/geocoding/v5/mapbox.places/test.json', {
        limit: '1',
        language: 'pt'
      });

      expect(url).toContain('access_token=');
      expect(url).toContain('limit=1');
      expect(url).toContain('language=pt');
    }
  });
});
