# System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Applications"
        React[React App]
        Vue[Vue App]
        Angular[Angular App]
    end
    
    subgraph "TS-ACL Library"
        subgraph "API Layer"
            ExpressMiddleware[Express Middleware]
            Decorators[TypeScript Decorators]
            Guards[Route Guards]
        end
        
        subgraph "Core Layer"
            ACLService[ACL Service]
            RoleService[Role Service]
            PermissionService[Permission Service]
            UserService[User Service]
        end
        
        subgraph "Data Layer"
            RoleRepository[Role Repository]
            UserRepository[User Repository]
            PermissionRepository[Permission Repository]
        end
        
        subgraph "Models"
            RoleModel[Role Model]
            UserModel[User Model]
            PermissionModel[Permission Model]
        end
    end
    
    subgraph "Database"
        MongoDB[(MongoDB with Mongoose)]
    end
    
    subgraph "Cache Layer (Optional)"
        Redis[(Redis Cache)]
    end
    
    React --> ExpressMiddleware
    Vue --> ExpressMiddleware
    Angular --> ExpressMiddleware
    
    ExpressMiddleware --> ACLService
    Decorators --> ACLService
    Guards --> ACLService
    
    ACLService --> RoleService
    ACLService --> PermissionService
    ACLService --> UserService
    
    RoleService --> RoleRepository
    PermissionService --> PermissionRepository
    UserService --> UserRepository
    
    RoleRepository --> RoleModel
    UserRepository --> UserModel
    PermissionRepository --> PermissionModel
    
    RoleModel --> MongoDB
    UserModel --> MongoDB
    PermissionModel --> MongoDB
    
    ACLService -.-> Redis
```

## Główne komponenty:

### API Layer
- **Express Middleware**: Automatyczna autoryzacja requestów
- **TypeScript Decorators**: Deklaratywna kontrola dostępu na poziomie metod
- **Route Guards**: Ochrona tras/endpointów

### Core Layer
- **ACL Service**: Główna logika kontroli dostępu
- **Role Service**: Zarządzanie rolami i hierarchiami
- **Permission Service**: Zarządzanie uprawnieniami
- **User Service**: Zarządzanie przypisaniami użytkowników

### Data Layer
- **Repository Pattern**: Abstrakcja dostępu do danych
- **Mongoose Models**: Definicje schematów i walidacja

### Integracje
- **Frontend Libraries**: Dedykowane adaptery dla React/Vue/Angular
- **Caching**: Opcjonalne cachowanie dla wydajności
