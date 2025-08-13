# TS-ACL - TypeScript Access Control List

## 📚 Documentatione Access Control List library for Node.js applications with first-class TypeScript support and seamless integration with modern frontend frameworks.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)

## Key Features

- **Modular Architecture** - Framework-agnostic core with dedicated adapters
- **RBAC + ABAC** - Role-Based and Attribute-Based Access Control
- **TypeScript-first** - Full type support with IntelliSense
- **High Performance** - Multi-layer caching and optimized queries
- **Easy Integration** - Express middleware, decorators, frontend hooks
- **Fullstack Ready** - Dedicated packages for React/Vue/Angular
- **Hierarchical Roles** - Support for complex organizational structures
- **Resource-scoped** - Granular permissions at resource level

## Quick Start

```bash
npm install @ts-acl/core @ts-acl/express
```

```typescript
import { ACLService, MongooseACLProvider } from '@ts-acl/core';
import { createACLMiddleware } from '@ts-acl/express';

// Setup
const aclService = new ACLService(new MongooseACLProvider({
  connectionString: 'mongodb://localhost:27017/myapp'
}));

// Express integration
const acl = createACLMiddleware(aclService, {
  getUserId: (req) => req.user.id
});

// Usage
app.get('/api/admin', acl.permission('admin:access'), handler);
```

## Development Roadmap

We're following a structured 6-phase development approach. See [detailed milestones](./docs/milestones.md) for complete timeline.

| Phase | Version | Status | Description |
|-------|---------|--------|-------------|
| 🏗️ **Foundation** | v0.1.0 | 🚧 Planning | Core models, repositories, TypeScript setup |
| ⚙️ **Core Logic** | v0.2.0 | 📋 Planned | ACL services, role hierarchy, caching |
| 🔌 **Express Integration** | v0.3.0 | 📋 Planned | Middleware, decorators, route guards |
| 🚀 **Advanced Features** | v0.4.0 | 📋 Planned | Dynamic permissions, audit logging |
| 🎨 **Frontend Packages** | v1.0.0 | 📋 Planned | React, Vue, Angular integrations |
| 🏢 **Production Ready** | v1.1.0+ | 📋 Planned | CLI tools, admin dashboard, monitoring |

**Current Focus**: Phase 1 - Setting up core foundation with Mongoose models and repository patterns.

## �📚 Documentation

- 📖 [Technical Overview](./docs/technical-overview.md)
- 🏗️ [System Architecture](./docs/diagrams/system-architecture.md)
- 💾 [Data Model](./docs/diagrams/data-model.md)
- 🔄 [Authorization Flow](./docs/diagrams/authorization-flow.md)
- 🎨 [Frontend Integration](./docs/diagrams/frontend-integration.md)
- 🔧 [API Design](./docs/api-design.md)
- 🎯 [Development Milestones](./docs/milestones.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who make this project possible