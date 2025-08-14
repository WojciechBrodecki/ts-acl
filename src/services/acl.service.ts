import {
  IACLService,
  IACLServiceConfig,
  IAssignmentOptions,
  IPermissionCheckResult,
  IPermissionContext,
  IServicePermission,
  IServiceRole
} from './acl-service.interface';
import { PermissionAction } from '../interfaces';

/**
 * In-memory data structures for initial implementation
 */
interface IUserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  expiresAt?: Date;
}


/**
 * Simple in-memory cache
 */
class SimpleCache {
  private readonly cache = new Map<string, { data: unknown; expiresAt: number }>();
  private readonly ttl: number;

  public constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000; // Convert to milliseconds
  }

  public set(key: string, value: unknown): void {
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + this.ttl
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public deleteByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}
/* End of SimpleCache class */

class ACLService implements IACLService {
  private readonly config: IACLServiceConfig;
  private readonly cache: SimpleCache;

  // In-memory data stores (will be replaced with repositories later)
  private readonly roles = new Map<string, IServiceRole>();
  private readonly permissions = new Map<string, IServicePermission>();
  private readonly userRoles = new Map<string, IUserRole[]>();
  // Direct user permissions removed: users gain permissions only via roles

  public constructor(config: IACLServiceConfig = {}) {
    this.config = {
      cacheEnabled: true,
      cacheTTL: 300, // 5 minutes
      debugMode: false,
      strictMode: false,
      ...config
    };

    this.cache = new SimpleCache(this.config.cacheTTL);
    this.initializeDefaults();
  }

  public async hasPermission(context: IPermissionContext): Promise<boolean> {
    const result = await this.checkPermission(context);
    return result.granted;
  }

  public async checkPermission(context: IPermissionContext): Promise<IPermissionCheckResult> {
    const cacheKey = this.getCacheKey('permission', context.userId, context.action, context.resourceType || 'any');

    if (this.config.cacheEnabled) {
      const cached = this.cache.get<IPermissionCheckResult>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const result = await this.evaluatePermission(context);

    // Cache the result
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  public async hasRole(userId: string, roleName: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(role => role.name === roleName);
  }

  public async getUserRoles(userId: string): Promise<IServiceRole[]> {
    const cacheKey = this.getCacheKey('user-roles', userId);

    if (this.config.cacheEnabled) {
      const cached = this.cache.get<IServiceRole[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const userRoleAssignments = this.userRoles.get(userId) || [];
    const activeRoles = userRoleAssignments
      .filter(assignment => this.isAssignmentActive(assignment))
      .map(assignment => this.roles.get(assignment.roleId))
      .filter((role): role is IServiceRole => role !== undefined);

    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, activeRoles);
    }

    return activeRoles;
  }

  public async getUserPermissions(userId: string): Promise<IServicePermission[]> {
    const cacheKey = this.getCacheKey('user-role-permissions', userId);

    if (this.config.cacheEnabled) {
      const cached = this.cache.get<IServicePermission[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const userRoles = await this.getUserRoles(userId);
    const rolePermissions = userRoles
      .flatMap(role => role.permissions)
      .map(permissionId => this.permissions.get(permissionId))
      .filter((permission): permission is IServicePermission => permission !== undefined);

    const uniquePermissions = rolePermissions.filter(
      (permission, index, array) => array.findIndex(p => p.id === permission.id) === index
    );

    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, uniquePermissions);
    }

    return uniquePermissions;
  }

  public async assignRole(userId: string, roleId: string, options?: IAssignmentOptions): Promise<void> {
    if (!this.roles.has(roleId)) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    const userRoleList = this.userRoles.get(userId) || [];

    const existingAssignment = userRoleList.find(assignment => assignment.roleId === roleId);
    if (existingAssignment) {
      throw new Error(`Role ${roleId} already assigned to user ${userId}`);
    }

    const assignment: IUserRole = {
      userId,
      roleId,
      assignedAt: new Date(),
      expiresAt: options?.expiresAt
    };

    userRoleList.push(assignment);
    this.userRoles.set(userId, userRoleList);

    await this.clearUserCache(userId); // to avoid stale cache
  }

  public async revokeRole(userId: string, roleId: string): Promise<void> {
    const userRoleList = this.userRoles.get(userId) || [];
    const filteredRoles = userRoleList.filter(assignment => assignment.roleId !== roleId);

    if (filteredRoles.length === userRoleList.length) {
      throw new Error(`Role ${roleId} not assigned to user ${userId}`);
    }

    this.userRoles.set(userId, filteredRoles);
    await this.clearUserCache(userId);
  }

  // grantPermission / revokePermission removed: enforce role-only permissions

  public async clearUserCache(userId: string): Promise<void> {
    if (!this.config.cacheEnabled) return;

    // Clear user-specific cache entries (roles and computed permissions)
    this.cache.deleteByPrefix(`user-roles-${userId}`);
    this.cache.deleteByPrefix(`user-role-permissions-${userId}`);
    this.cache.deleteByPrefix(`permission-${userId}`); // for permission evaluation cache
  }

  public async clearCache(): Promise<void> {
    if (!this.config.cacheEnabled) return;
    this.cache.clear();
  }

  public addRole(role: IServiceRole): void {
    this.roles.set(role.id, role);
  }

  public addPermission(permission: IServicePermission): void {
    this.permissions.set(permission.id, permission);
  }

  private async evaluatePermission(context: IPermissionContext): Promise<IPermissionCheckResult> {
    const userPermissions = await this.getUserPermissions(context.userId); // derived solely from roles now
    const userRoles = await this.getUserRoles(context.userId);

    const exactMatch = userPermissions.find(permission =>
      permission.action === context.action &&
      (!context.resourceType || !permission.resourceType || permission.resourceType === context.resourceType)
    );
    if (exactMatch) {
      return {
        granted: true,
        reason: `Permission granted via role permission: ${exactMatch.name}`,
        appliedPermissions: [exactMatch.id],
        appliedRoles: userRoles.map(r => r.id),
        evaluatedAt: new Date()
      };
    }

    const allPermission = userPermissions.find(permission => permission.action === PermissionAction.ALL);
    if (allPermission) {
      return {
        granted: true,
        reason: `Permission granted via role ALL permission: ${allPermission.name}`,
        appliedPermissions: [allPermission.id],
        appliedRoles: userRoles.map(r => r.id),
        evaluatedAt: new Date()
      };
    }

    return {
      granted: false,
      reason: `No matching permission found for action: ${context.action}`,
      appliedRoles: userRoles.map(role => role.id),
      evaluatedAt: new Date()
    };
  }

  private isAssignmentActive(assignment: { expiresAt?: Date }): boolean {
    return !assignment.expiresAt || assignment.expiresAt > new Date();
  }

  private getCacheKey(...parts: string[]): string {
    return parts.join('-');
  }

  private initializeDefaults(): void {
    // Add some default permissions for testing
    this.addPermission({
      id: 'read-all',
      name: 'Read All',
      action: PermissionAction.READ,
    });

    this.addPermission({
      id: 'admin-all',
      name: 'Admin All',
      action: PermissionAction.ALL
    });

    this.addRole({
      id: 'admin',
      name: 'Admin',
      permissions: ['admin-all']
    });

    this.addRole({
      id: 'user',
      name: 'User',
      permissions: ['read-all']
    });
  }
}

export default ACLService;
