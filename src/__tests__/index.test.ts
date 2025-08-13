import { ACLConfig, TSACL } from '../index';

describe('TSACL', () => {
  let acl: TSACL;

  beforeEach(() => {
    acl = new TSACL();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const aclWithDefaults = new TSACL();
      expect(aclWithDefaults).toBeInstanceOf(TSACL);
    });

    it('should create instance with custom config', () => {
      const config: ACLConfig = {
        database: {
          url: 'mongodb://localhost:27017/test',
        },
        cache: {
          enabled: true,
          ttl: 300,
        },
        logging: {
          level: 'debug',
        },
      };

      const aclWithConfig = new TSACL(config);
      expect(aclWithConfig).toBeInstanceOf(TSACL);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await acl.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('TS-ACL initialized with config:', {});
      
      consoleSpy.mockRestore();
    });
  });

  describe('hasPermission', () => {
    it('should return false for any permission check (placeholder)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = await acl.hasPermission('user123', 'posts', 'read');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Checking permission for user user123 on posts:read'
      );
      
      consoleSpy.mockRestore();
    });
  });
});
