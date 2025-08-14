# TS-ACL Core Service Example

This example demonstrates how to use the Core ACL Service.

## Installation

```bash
npm install @ts-acl/core
```

## Basic Usage

```typescript
import { ACLService, PermissionAction } from '@ts-acl/core';

// Initialize ACL Service
const acl = new ACLService({
  cacheEnabled: true,
  cacheTTL: 300, // 5 minutes
  debugMode: false
});

// Example: Blog application permissions
async function setupBlogPermissions() {
  // Add custom permissions
  acl.addPermission({
    id: 'create-post',
    name: 'Create Post',
    action: PermissionAction.CREATE,
    resourceType: 'post'
  });

  acl.addPermission({
    id: 'edit-post',
    name: 'Edit Post',
    action: PermissionAction.UPDATE,
    resourceType: 'post'
  });

  acl.addPermission({
    id: 'delete-post',
    name: 'Delete Post',
    action: PermissionAction.DELETE,
    resourceType: 'post'
  });

  // Add roles
  acl.addRole({
    id: 'author',
    name: 'Author',
    permissions: ['create-post', 'edit-post']
  });

  acl.addRole({
    id: 'editor',
    name: 'Editor',
    permissions: ['create-post', 'edit-post', 'delete-post']
  });

  // Assign roles to users
  await acl.assignRole('user123', 'author');
  await acl.assignRole('user456', 'editor');

  // Check permissions
  const canCreatePost = await acl.hasPermission({
    userId: 'user123',
    action: PermissionAction.CREATE,
    resourceType: 'post'
  });

  console.log('User can create post:', canCreatePost); // true

  const canDeletePost = await acl.hasPermission({
    userId: 'user123',
    action: PermissionAction.DELETE,
    resourceType: 'post'
  });

  console.log('User can delete post:', canDeletePost); // false

  // Get detailed permission check
  const permissionCheck = await acl.checkPermission({
    userId: 'user123',
    action: PermissionAction.CREATE,
    resourceType: 'post'
  });

  console.log('Permission check result:', permissionCheck);
  // {
  //   granted: true,
  //   reason: "Permission granted via direct permission: Create Post",
  //   appliedPermissions: ["create-post"],
  //   evaluatedAt: 2025-08-14T...
  // }
}

// Run the example
setupBlogPermissions().catch(console.error);
```

## Advanced Usage

### Direct Permission Assignment

```typescript
// Grant permission directly to user (bypassing roles)
await acl.grantPermission('user789', 'delete-post', {
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  reason: 'Temporary admin access'
});
```

### Cache Management

```typescript
// Clear cache for specific user
await acl.clearUserCache('user123');

// Clear all cache
await acl.clearCache();
```

### Role Management

```typescript
// Check if user has role
const isAdmin = await acl.hasRole('user123', 'Admin');

// Get all user roles
const userRoles = await acl.getUserRoles('user123');

// Get all user permissions (from roles + direct)
const userPermissions = await acl.getUserPermissions('user123');
```

## Key Features

- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Direct Permission Assignment**
- ✅ **Permission Inheritance from Roles**
- ✅ **In-Memory Caching with TTL**
- ✅ **Permission Expiration Support**
- ✅ **Context-Based Permission Evaluation**
- ✅ **Comprehensive Error Handling**
- ✅ **TypeScript Support with Full Type Safety**

## Next Steps

This is Phase 2 implementation with in-memory data storage.
Phase 3 will add database persistence with Mongoose models and repositories.
