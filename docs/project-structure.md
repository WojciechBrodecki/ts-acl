# TS-ACL Project Structure

## Updated file structure for @ts-acl/core:

```
ts-acl/
├── src/
│   ├── index.ts                        # Main entry point
│   │
│   ├── config/                         # Configuration
│   │   ├── index.ts                    # Re-export all configurations
│   │   └── environment.ts              # Environment variables and validation
│   │
│   ├── interfaces/                     # TypeScript interface definitions
│   │   ├── index.ts                    # Re-export all interfaces
│   │   ├── role.interface.ts           # Role interfaces
│   │   ├── permission.interface.ts     # Permission interfaces
│   │   ├── user.interface.ts           # User interfaces
│   │   ├── resource.interface.ts       # Resource interfaces
│   │   ├── repository.interface.ts     # Repository interfaces
│   │   ├── service.interface.ts        # Service interfaces
│   │   └── common.interface.ts         # Common interfaces (DTOs, enums)
│   │
│   ├── models/                         # Mongoose models
│   │   ├── index.ts                    # Re-export all models
│   │   ├── role.model.ts               # Role model
│   │   ├── user-role.model.ts          # UserRole model
│   │   ├── permission.model.ts         # Permission model
│   │   └── resource.model.ts           # Resource model
│   │
│   ├── repositories/                   # Data access layer (Data Access Layer)
│   │   ├── index.ts                    # Re-export all repositories
│   │   ├── base.repository.ts          # Base abstract repository
│   │   ├── role.repository.ts          # Role repository
│   │   ├── user-role.repository.ts     # User role assignment repository
│   │   ├── permission.repository.ts    # Permission repository
│   │   └── resource.repository.ts      # Resource repository
│   │
│   ├── services/                       # Business logic
│   │   ├── index.ts                    # Re-export all services
│   │   ├── acl.service.ts              # Main ACL service
│   │   ├── role.service.ts             # Role management service
│   │   ├── permission.service.ts       # Permission service
│   │   ├── user.service.ts             # User service
│   │   └── cache.service.ts            # Caching service
│   │
│   ├── utils/                          # Helper utilities
│   │   ├── index.ts                    # Re-export utilities
│   │   ├── validation.ts               # Data validation
│   │   ├── errors.ts                   # Custom errors
│   │   ├── logger.ts                   # Logging system
│   │   └── performance.ts              # Performance monitoring
│   │
│   └── middleware/                     # Express middleware (optional in core)
│       ├── index.ts                    # Re-export middleware
│       ├── auth.middleware.ts          # Authorization middleware
│       └── validation.middleware.ts    # Validation middleware
│
├── tests/                              # Tests (without underscores)
│   ├── unit/                           # Unit tests
│   │   ├── models/                     # Model tests
│   │   ├── repositories/               # Repository tests
│   │   ├── services/                   # Service tests
│   │   └── utils/                      # Utility tests
│   │
│   ├── integration/                    # Integration tests
│   │   ├── services/                   # Service tests with dependencies
│   │   └── scenarios/                  # Business scenarios
│   │
│   ├── fixtures/                       # Test data
│   │   ├── roles.json                  # Sample roles
│   │   ├── permissions.json            # Sample permissions
│   │   └── users.json                  # Sample users
│   │
│   └── setup/                          # Test configuration
│       ├── database.setup.ts           # Test database setup
│       ├── global.setup.ts             # Global configuration
│       └── teardown.ts                 # Cleanup after tests
│
├── docs/                               # Documentation (already exists)
├── examples/                           # Usage examples
│   ├── basic-usage.ts                  # Basic usage
│   ├── express-integration.ts          # Express integration
│   ├── role-hierarchy.ts               # Role hierarchy
│   └── advanced-permissions.ts         # Advanced permissions
│
├── scripts/                            # Helper scripts
│   ├── build.ts                        # Build script
│   ├── migrate.ts                      # Migration scripts
│   └── seed.ts                         # Data seeding script
│
├── .env.example                        # Environment variables example
├── .gitignore                          # Git ignore
├── .eslintrc.json                      # ESLint configuration
├── .prettierrc                         # Prettier configuration
├── tsconfig.json                       # TypeScript configuration
├── jest.config.js                      # Jest configuration
├── package.json                        # Dependencies and scripts
├── README.md                           # Main documentation
└── LICENSE                             # MIT License
```

## Changes and explanations:

### 1. **`interfaces/` instead of `types/`**
- Better naming - interfaces are more semantic in TypeScript context
- Clearly separates interfaces from helper types
- More intuitive for developers

### 2. **Database connection problem solution**

Instead of built-in connection management, the library should accept an existing connection:

```typescript
// Library initialization example
import { ACLService } from '@ts-acl/core';
import mongoose from 'mongoose';

// Application manages the connection
await mongoose.connect(process.env.MONGODB_URI);

// Library uses existing connection
const acl = new ACLService({
  connection: mongoose.connection, // Pass existing connection
  // or
  models: {
    Role: CustomRoleModel,      // Custom models (optional)
    UserRole: CustomUserRoleModel,
  },
  cache: {
    enabled: true,
    provider: redisClient,      // Optional cache provider
  }
});
```

**Advantages of this approach:**
- Library doesn't interfere with application connection management
- Ability to use existing models and configurations
- Better control over transactions and connection pooling
- Compatible with different architectural patterns

### 3. **`tests/` instead of `__tests__/`**
- Simpler and more readable
- Consistent with most TypeScript project standards
- Easier navigation

### 4. **Explanation of "Repositories" (Repository Pattern)**

**Repository Pattern** is a design pattern that:

#### **What is Repository:**
- **Abstraction layer** between business logic and database
- **Encapsulates** data access logic in one place
- **Provides** an interface resembling an in-memory object collection

#### **Why we use Repository:**
```typescript
// ❌ Without Repository - business logic mixed with data access
class UserService {
  async assignRole(userId: string, roleName: string) {
    // Direct database queries in service
    const user = await UserModel.findById(userId);
    const role = await RoleModel.findOne({ name: roleName });
    const assignment = new UserRoleModel({ userId, roleId: role._id });
    await assignment.save();
  }
}

// ✅ With Repository - clean separation of concerns
class UserService {
  constructor(
    private userRepo: IUserRepository,
    private roleRepo: IRoleRepository,
    private userRoleRepo: IUserRoleRepository
  ) {}

  async assignRole(userId: string, roleName: string) {
    // Only business logic
    const user = await this.userRepo.findById(userId);
    const role = await this.roleRepo.findByName(roleName);
    await this.userRoleRepo.create({ userId, roleId: role.id });
  }
}
```

#### **Repository Pattern Benefits:**
1. **Testability** - easy mocking in tests
2. **Flexibility** - easy database switching (MongoDB → PostgreSQL)
3. **Reusability** - same access logic in different services
4. **Readability** - clear separation between business logic and data access
5. **Caching** - central place for cache implementation

#### **Implementation example:**
```typescript
// Repository Interface
interface IRoleRepository {
  findById(id: string): Promise<IRole | null>;
  findByName(name: string): Promise<IRole | null>;
  create(roleData: ICreateRoleDto): Promise<IRole>;
  update(id: string, data: IUpdateRoleDto): Promise<IRole>;
  delete(id: string): Promise<void>;
  findWithPermissions(id: string): Promise<IRole>;
}

// Mongoose implementation
class MongooseRoleRepository implements IRoleRepository {
  async findById(id: string): Promise<IRole | null> {
    return await RoleModel.findById(id).lean();
  }
  
  async findByName(name: string): Promise<IRole | null> {
    return await RoleModel.findOne({ name }).lean();
  }
  
  // ... other methods
}
```

## Next steps:

1. **Create basic interfaces** in `src/interfaces/`
2. **Implement base repository** with common logic
3. **Create Mongoose models** with validation
4. **Implement specific repositories**
5. **Build services** using repositories

Does this structure and explanations meet your expectations?
