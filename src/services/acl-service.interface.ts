import { PermissionAction } from '../interfaces';

interface IPermissionContext {
  userId: string;
  action: PermissionAction;
  resourceId?: string;
  resourceType?: string;
  additionalContext?: Record<string, unknown>;
}

interface IServiceRole {
  id: string;
  name: string;
  permissions: string[];
}

interface IServicePermission {
  id: string;
  name: string;
  action: PermissionAction;
  resourceType?: string;
}

interface IPermissionCheckResult {
  granted: boolean;
  reason: string;
  appliedRoles?: string[];
  appliedPermissions?: string[];
  evaluatedAt: Date;
}

interface IACLServiceConfig {
  cacheEnabled?: boolean;
  cacheTTL?: number; // seconds
  debugMode?: boolean;
  strictMode?: boolean; // fail on unknown permissions
}

interface IACLService {
  hasPermission(context: IPermissionContext): Promise<boolean>;
  checkPermission(context: IPermissionContext): Promise<IPermissionCheckResult>;
  hasRole(userId: string, roleName: string): Promise<boolean>;
  getUserRoles(userId: string): Promise<IServiceRole[]>;
  getUserPermissions(userId: string): Promise<IServicePermission[]>;
  assignRole(userId: string, roleId: string, options?: IAssignmentOptions): Promise<void>;
  revokeRole(userId: string, roleId: string): Promise<void>;
  clearUserCache(userId: string): Promise<void>;
  clearCache(): Promise<void>;
}

interface IAssignmentOptions {
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  reason?: string;
}

export {
  IACLService,
  IACLServiceConfig,
  IAssignmentOptions,
  IPermissionCheckResult,
  IPermissionContext,
  IServicePermission,
  IServiceRole
};
