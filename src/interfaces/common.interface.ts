export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ALL = '*'
}

export enum CacheType {
  MEMORY = 'memory',
  REDIS = 'redis',
  NONE = 'none'
}

export enum ErrorType {
  VALIDATION_ERROR = 'ValidationError',
  NOT_FOUND_ERROR = 'NotFoundError',
  PERMISSION_DENIED_ERROR = 'PermissionDeniedError',
  DUPLICATE_ERROR = 'DuplicateError',
  UNAUTHORIZED_ERROR = 'UnauthorizedError',
  INTERNAL_ERROR = 'InternalError'
}

export interface ICacheConfig {
  type: CacheType;
  ttl?: number; // Time to live in seconds
  prefix?: string;
  host?: string;
  port?: number;
  password?: string;
}

export interface IDatabaseConfig {
  connection?: unknown; // Mongoose connection - will be typed more specifically later
  models?: {
    Role?: unknown;
    UserRole?: unknown;
    Permission?: unknown;
    Resource?: unknown;
  };
}

export interface IACLConfig {
  database: IDatabaseConfig;
  cache?: ICacheConfig;
  defaultPermissions?: string[];
  strictMode?: boolean;
  auditEnabled?: boolean;
}