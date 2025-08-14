import ACLService from '../src/services/acl.service';
import { PermissionAction } from '../src/interfaces';
import { IPermissionContext, IServicePermission, IServiceRole } from '../src/services/acl-service.interface';

describe('ACLService', () => {
  let aclService: ACLService;

  beforeEach(() => {
    aclService = new ACLService({
      cacheEnabled: false, // Disable cache for testing
      debugMode: true
    });
  });

  describe('Permission Evaluation (role-only)', () => {
  it('should grant permissions via role', async () => {
      const userId = 'user1';
      const context: IPermissionContext = { userId, action: PermissionAction.READ };
      await aclService.assignRole(userId, 'user'); // role has read-all
      const result = await aclService.checkPermission(context);
      expect(result.granted).toBe(true);
      expect(result.reason).toContain('role permission');
      expect(result.appliedRoles).toContain('user');
    });

  it('should deny if user does not have a role with the permission', async () => {
      const context: IPermissionContext = { userId: 'user1', action: PermissionAction.DELETE };
      const result = await aclService.checkPermission(context);
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('No matching permission');
    });

  it('admin role should grant ALL for any action', async () => {
      const userId = 'user1';
      await aclService.assignRole(userId, 'admin');
      const canRead = await aclService.hasPermission({ userId, action: PermissionAction.READ });
      const canCreate = await aclService.hasPermission({ userId, action: PermissionAction.CREATE });
      expect(canRead).toBe(true);
      expect(canCreate).toBe(true);
    });
  });

  describe('Role Management', () => {
    it('should assign and check roles', async () => {
      // Arrange
      const userId = 'user1';
      const roleName = 'Admin'; // Use correct role name

      // Act
      await aclService.assignRole(userId, 'admin');
      const hasRole = await aclService.hasRole(userId, roleName);
      const userRoles = await aclService.getUserRoles(userId);

      // Assert
      expect(hasRole).toBe(true);
      expect(userRoles).toHaveLength(1);
      expect(userRoles[0].name).toBe('Admin');
      expect(userRoles[0].id).toBe('admin');
    });

    it('should inherit permissions from roles', async () => {
      // Arrange
      const userId = 'user1';
      const context: IPermissionContext = {
        userId,
        action: PermissionAction.READ
      };

      // Act
      await aclService.assignRole(userId, 'user'); // 'user' role has 'read-all' permission
      const hasPermission = await aclService.hasPermission(context);
      const userPermissions = await aclService.getUserPermissions(userId);

      // Assert
      expect(hasPermission).toBe(true);
      expect(userPermissions).toHaveLength(1);
      expect(userPermissions[0].name).toBe('Read All');
    });

    // Removed test combining role + direct permission (no direct permissions now)

    it('should revoke roles correctly', async () => {
      // Arrange
      const userId = 'user1';

      // Act
      await aclService.assignRole(userId, 'admin');
      expect(await aclService.hasRole(userId, 'Admin')).toBe(true); // Use correct role name

      await aclService.revokeRole(userId, 'admin');
      expect(await aclService.hasRole(userId, 'Admin')).toBe(false); // Use correct role name
    });

    it('should throw error when assigning non-existent role', async () => {
      // Arrange
      const userId = 'user1';
      const invalidRoleId = 'non-existent';

      // Act & Assert
      await expect(aclService.assignRole(userId, invalidRoleId))
        .rejects
        .toThrow('Role with ID non-existent not found');
    });

    it('should throw error when assigning already assigned role', async () => {
      // Arrange
      const userId = 'user1';
      const roleId = 'admin';

      // Act
      await aclService.assignRole(userId, roleId);

      // Assert
      await expect(aclService.assignRole(userId, roleId))
        .rejects
        .toThrow(`Role ${roleId} already assigned to user ${userId}`);
    });
  });

  describe('Role Expiration', () => {
    it('should respect role expiration', async () => {
      const userId = 'user1';
      const expiredDate = new Date(Date.now() - 1000);
      await aclService.assignRole(userId, 'admin', { expiresAt: expiredDate });
      expect(await aclService.hasRole(userId, 'admin')).toBe(false);
    });
  });

  describe('Cache Management', () => {
    beforeEach(() => {
      // Enable cache for these tests
      aclService = new ACLService({
        cacheEnabled: true,
        cacheTTL: 60 // 1 minute
      });
    });

    it('should clear user cache when roles change', async () => {
      const userId = 'user1';
      const context: IPermissionContext = { userId, action: PermissionAction.READ };
      await aclService.assignRole(userId, 'user');
      expect(await aclService.hasPermission(context)).toBe(true);
      await aclService.revokeRole(userId, 'user');
      expect(await aclService.hasPermission(context)).toBe(false);
    });

    it('should clear all cache', async () => {
      // Arrange
      const userId = 'user1';
      await aclService.assignRole(userId, 'user');

      // Act
      await aclService.clearCache();

      // This test mainly ensures no errors are thrown
      expect(true).toBe(true);
    });
  });

  describe('Custom Roles and Permissions', () => {
    it('should work with custom roles and permissions', async () => {
      // Arrange
      const customRole: IServiceRole = {
        id: 'editor',
        name: 'Editor',
        permissions: ['read-all', 'write-docs']
      };

      const customPermission: IServicePermission = {
        id: 'write-docs',
        name: 'Write Documents',
        action: PermissionAction.UPDATE,
        resourceType: 'document'
      };

      aclService.addRole(customRole);
      aclService.addPermission(customPermission);

      const userId = 'user1';
      const context: IPermissionContext = {
        userId,
        action: PermissionAction.UPDATE,
        resourceType: 'document'
      };

      // Act
      await aclService.assignRole(userId, 'editor');
      const hasPermission = await aclService.hasPermission(context);
      const userPermissions = await aclService.getUserPermissions(userId);

      // Assert
      expect(hasPermission).toBe(true);
      expect(userPermissions).toHaveLength(2); // read-all + write-docs (both via role)
    });
  });
});
