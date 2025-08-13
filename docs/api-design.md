# TS-ACL API Design

## Core API Interface

### ACL Service Interface
```typescript
interface IACLService {
  // Permission checking
  hasPermission(userId: string, permission: string, resource?: string): Promise<boolean>;
  hasAnyPermission(userId: string, permissions: string[], resource?: string): Promise<boolean>;
  hasAllPermissions(userId: string, permissions: string[], resource?: string): Promise<boolean>;
  
  // Role management
  assignRole(userId: string, roleName: string, resource?: string, expiresAt?: Date): Promise<void>;
  revokeRole(userId: string, roleName: string, resource?: string): Promise<void>;
  getUserRoles(userId: string, resource?: string): Promise<IRole[]>;
  
  // Bulk operations
  assignRoleBulk(assignments: IRoleAssignment[]): Promise<void>;
  revokeRoleBulk(revocations: IRoleRevocation[]): Promise<void>;
  
  // Permission inheritance
  getEffectivePermissions(userId: string, resource?: string): Promise<string[]>;
  getPermissionHierarchy(userId: string): Promise<IPermissionHierarchy>;
}
```

### Role Service Interface
```typescript
interface IRoleService {
  // CRUD operations
  createRole(roleData: ICreateRoleDto): Promise<IRole>;
  updateRole(roleId: string, updateData: IUpdateRoleDto): Promise<IRole>;
  deleteRole(roleId: string): Promise<void>;
  findRole(query: IRoleQuery): Promise<IRole | null>;
  findRoles(query: IRoleQuery): Promise<IRole[]>;
  
  // Permission management
  addPermissionToRole(roleId: string, permission: string): Promise<void>;
  removePermissionFromRole(roleId: string, permission: string): Promise<void>;
  setRolePermissions(roleId: string, permissions: string[]): Promise<void>;
  
  // Hierarchy management
  setParentRole(childRoleId: string, parentRoleId: string): Promise<void>;
  removeParentRole(childRoleId: string): Promise<void>;
  getRoleHierarchy(roleId: string): Promise<IRoleHierarchy>;
  getChildRoles(roleId: string): Promise<IRole[]>;
}
```

### Express Middleware
```typescript
// Functional middleware
function requirePermission(permission: string, options?: IAuthOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserIdFromRequest(req);
      const resource = getResourceFromRequest(req, options);
      
      const hasAccess = await aclService.hasPermission(userId, permission, resource);
      
      if (hasAccess) {
        next();
      } else {
        res.status(403).json({ error: 'Access denied' });
      }
    } catch (error) {
      next(error);
    }
  };
}

// Class-based middleware
class ACLMiddleware {
  constructor(private aclService: IACLService) {}
  
  permission(permission: string, options?: IAuthOptions) {
    return this.requirePermission.bind(this, permission, options);
  }
  
  anyPermission(permissions: string[], options?: IAuthOptions) {
    return this.requireAnyPermission.bind(this, permissions, options);
  }
  
  allPermissions(permissions: string[], options?: IAuthOptions) {
    return this.requireAllPermissions.bind(this, permissions, options);
  }
}
```

### TypeScript Decorators
```typescript
// Method decorators
function RequirePermission(permission: string, options?: IAuthOptions) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const userId = this.getCurrentUserId(); // Implementation dependent
      const resource = options?.resource || this.getResourceContext?.();
      
      const hasAccess = await aclService.hasPermission(userId, permission, resource);
      
      if (!hasAccess) {
        throw new ForbiddenError(`Permission denied: ${permission}`);
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// Class decorators
function RequireRole(roleName: string) {
  return function<T extends new(...args: any[]) => {}>(constructor: T) {
    return class extends constructor {
      async checkAccess() {
        const userId = this.getCurrentUserId();
        const userRoles = await aclService.getUserRoles(userId);
        
        if (!userRoles.some(role => role.name === roleName)) {
          throw new ForbiddenError(`Role required: ${roleName}`);
        }
      }
    };
  };
}

// Usage examples
class PostController {
  @RequirePermission('read:posts')
  async getPosts() {
    return this.postService.findAll();
  }
  
  @RequirePermission('write:posts')
  async createPost(@Body() postData: CreatePostDto) {
    return this.postService.create(postData);
  }
  
  @RequirePermission('delete:posts', { resource: 'post' })
  async deletePost(@Param('id') postId: string) {
    return this.postService.delete(postId);
  }
}
```

## Data Models

### Role Model
```typescript
interface IRole {
  _id: ObjectId;
  name: string;
  description?: string;
  permissions: string[];
  parentRoleId?: ObjectId;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface ICreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
  parentRoleId?: string;
  metadata?: Record<string, any>;
}

interface IUpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  parentRoleId?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}
```

### User Role Assignment Model
```typescript
interface IUserRole {
  _id: ObjectId;
  userId: string;
  roleId: ObjectId;
  resourceType?: string;
  resourceId?: string;
  grantedAt: Date;
  expiresAt?: Date;
  grantedBy: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

interface IRoleAssignment {
  userId: string;
  roleName: string;
  resourceType?: string;
  resourceId?: string;
  expiresAt?: Date;
  grantedBy?: string;
  metadata?: Record<string, any>;
}
```

### Permission Model
```typescript
interface IPermission {
  _id: ObjectId;
  name: string;
  action: string;
  resourceType: string;
  description?: string;
  conditions?: IPermissionCondition[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface IPermissionCondition {
  type: 'time' | 'location' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'nin';
  value: any;
  metadata?: Record<string, any>;
}
```

## Configuration

### Main Configuration
```typescript
interface IACLConfig {
  // Database configuration
  database: {
    connectionString: string;
    options?: mongoose.ConnectOptions;
  };
  
  // Caching configuration
  cache?: {
    provider: 'memory' | 'redis';
    ttl: number;
    maxSize?: number;
    redis?: {
      host: string;
      port: number;
      password?: string;
      db?: number;
    };
  };
  
  // Security configuration
  security: {
    failSecure: boolean;
    maxRoleDepth: number;
    allowWildcardPermissions: boolean;
  };
  
  // Performance configuration
  performance: {
    batchSize: number;
    maxConcurrentQueries: number;
    queryTimeout: number;
  };
  
  // Logging configuration
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    auditTrail: boolean;
    performanceLogging: boolean;
  };
}
```

### Express Integration Configuration
```typescript
interface IExpressACLConfig {
  // User ID extraction
  getUserId: (req: Request) => string | Promise<string>;
  
  // Resource extraction
  getResource?: (req: Request) => string | undefined;
  
  // Error handling
  onUnauthorized?: (req: Request, res: Response, permission: string) => void;
  onError?: (req: Request, res: Response, error: Error) => void;
  
  // Caching
  cacheUserPermissions?: boolean;
  userPermissionsTTL?: number;
}
```

## Usage Examples

### Basic Setup
```typescript
import { ACLService, MongooseACLProvider } from '@ts-acl/core';
import { createACLMiddleware } from '@ts-acl/express';

// Initialize ACL
const aclProvider = new MongooseACLProvider({
  connectionString: 'mongodb://localhost:27017/myapp',
  cache: {
    provider: 'redis',
    ttl: 300,
    redis: { host: 'localhost', port: 6379 }
  }
});

const aclService = new ACLService(aclProvider);

// Express middleware
const aclMiddleware = createACLMiddleware(aclService, {
  getUserId: (req) => req.user.id,
  getResource: (req) => req.params.resourceId
});

// Usage in routes
app.get('/api/posts', 
  aclMiddleware.permission('read:posts'),
  (req, res) => {
    // Handler code
  }
);

app.post('/api/posts/:id', 
  aclMiddleware.permission('edit:posts', { resource: 'post' }),
  (req, res) => {
    // Handler code
  }
);
```

### Advanced Usage with Decorators
```typescript
@Controller('/api/posts')
@RequireRole('user')
class PostController {
  constructor(
    private postService: PostService,
    private aclService: ACLService
  ) {}
  
  @Get()
  @RequirePermission('read:posts')
  async getAllPosts() {
    return this.postService.findAll();
  }
  
  @Get(':id')
  @RequirePermission('read:posts')
  async getPost(@Param('id') id: string) {
    // Additional check for specific resource
    const canReadSpecific = await this.aclService.hasPermission(
      this.getCurrentUserId(),
      'read:post',
      id
    );
    
    if (!canReadSpecific) {
      throw new ForbiddenError('Cannot read this specific post');
    }
    
    return this.postService.findById(id);
  }
  
  @Post()
  @RequirePermission('create:posts')
  async createPost(@Body() postData: CreatePostDto) {
    return this.postService.create({
      ...postData,
      authorId: this.getCurrentUserId()
    });
  }
  
  @Put(':id')
  @RequirePermission('edit:posts')
  async updatePost(
    @Param('id') id: string,
    @Body() updateData: UpdatePostDto
  ) {
    // Check if user can edit this specific post
    const canEdit = await this.aclService.hasPermission(
      this.getCurrentUserId(),
      'edit:post',
      id
    );
    
    if (!canEdit) {
      throw new ForbiddenError('Cannot edit this post');
    }
    
    return this.postService.update(id, updateData);
  }
}
```
