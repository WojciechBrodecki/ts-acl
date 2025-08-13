# Authorization Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant ACLMiddleware
    participant ACLService
    participant RoleService
    participant PermissionService
    participant Cache
    participant MongoDB
    
    Client->>Express: HTTP Request with JWT/Session
    Express->>ACLMiddleware: Route Handler
    
    alt Check Cache First
        ACLMiddleware->>Cache: Check user permissions cache
        Cache-->>ACLMiddleware: Cache hit/miss
    end
    
    ACLMiddleware->>ACLService: hasPermission(userId, action, resource)
    ACLService->>RoleService: getUserRoles(userId, resource)
    
    alt Roles not cached
        RoleService->>MongoDB: Query user roles
        MongoDB-->>RoleService: Return roles
        RoleService->>Cache: Cache user roles
    end
    
    RoleService-->>ACLService: Return user roles
    
    loop For each role
        ACLService->>PermissionService: getRolePermissions(roleId)
        
        alt Permissions not cached
            PermissionService->>MongoDB: Query role permissions
            MongoDB-->>PermissionService: Return permissions
            PermissionService->>Cache: Cache permissions
        end
        
        PermissionService-->>ACLService: Return permissions
    end
    
    ACLService->>ACLService: Evaluate permission rules
    
    alt Permission granted
        ACLService-->>ACLMiddleware: true
        ACLMiddleware-->>Express: Continue to handler
        Express-->>Client: Success response
    else Permission denied
        ACLService-->>ACLMiddleware: false
        ACLMiddleware-->>Express: 403 Forbidden
        Express-->>Client: Access denied
    end
```

## Flow Authorization Process:

### 1. Request Phase
- Klient wysyła request z tokenem uwierzytelnienia
- Express przekazuje request do ACL Middleware

### 2. Cache Check
- Sprawdzenie cache dla uprawnień użytkownika
- Jeśli hit - wykorzystanie cached data
- Jeśli miss - pobranie z bazy danych

### 3. Role Resolution
- Pobranie ról przypisanych do użytkownika
- Uwzględnienie zakresu zasobu (resource scope)
- Cache'owanie wyników dla przyszłych requestów

### 4. Permission Evaluation
- Iteracja przez wszystkie role użytkownika
- Pobranie uprawnień dla każdej roli
- Sprawdzenie hierarchii ról (dziedziczenie)

### 5. Decision Making
- Sprawdzenie czy requested action jest dozwolona
- Ewaluacja warunków (conditions) jeśli istnieją
- Zwrócenie decyzji (allow/deny)

### 6. Response
- Jeśli allowed - kontynuacja do handler'a
- Jeśli denied - zwrot 403 Forbidden

## Performance Optimizations:

### Caching Strategy
```javascript
// Cache keys structure
user_roles:{userId}:{resourceType} = [roleIds...]
role_permissions:{roleId} = [permissions...]
user_permissions:{userId}:{resourceType} = [permissions...]

// TTL settings
user_roles: 300s (5 min)
role_permissions: 3600s (1 hour)
user_permissions: 600s (10 min)
```

### Bulk Operations
- Batch loading ról dla grup użytkowników
- Preloading popularnych kombinacji permission
- Background refresh cache'a przed expiry
