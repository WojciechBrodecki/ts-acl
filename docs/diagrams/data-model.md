# Data Model Diagram

```mermaid
erDiagram
    ROLE {
        ObjectId _id
        string name
        string description
        string[] permissions
        ObjectId parent_role_id
        boolean is_active
        Date created_at
        Date updated_at
    }
    
    USER_ROLE {
        ObjectId _id
        string user_id
        ObjectId role_id
        string resource_type
        string resource_id
        Date granted_at
        Date expires_at
        string granted_by
        boolean is_active
    }
    
    PERMISSION {
        ObjectId _id
        string name
        string action
        string resource_type
        string description
        object conditions
        Date created_at
        Date updated_at
    }
    
    RESOURCE {
        ObjectId _id
        string name
        string type
        string description
        object metadata
        Date created_at
        Date updated_at
    }
    
    ROLE_HIERARCHY {
        ObjectId parent_role_id
        ObjectId child_role_id
        number inheritance_level
        Date created_at
    }
    
    %% Relationships
    ROLE ||--o{ USER_ROLE : "assigned_to"
    ROLE ||--o{ ROLE_HIERARCHY : "has_children"
    ROLE ||--o{ ROLE_HIERARCHY : "has_parent"
    PERMISSION ||--o{ ROLE : "included_in"
    RESOURCE ||--o{ USER_ROLE : "scoped_to"
    RESOURCE ||--o{ PERMISSION : "applies_to"
```

## Opis modeli:

### ROLE (Role)
- Główna encja reprezentująca rolę w systemie
- Może mieć rodzica (hierarchia ról)
- Zawiera listę uprawnień
- Wspiera dziedziczenie uprawnień z roli nadrzędnej

### USER_ROLE (UserRole Assignment)
- Przypisanie roli do użytkownika
- Może być ograniczone do konkretnego zasobu
- Wspiera czasowe przypisania (expires_at)
- Śledzi kto i kiedy przyznał uprawnienie

### PERMISSION (Permission)
- Definicja konkretnego uprawnienia
- Składa się z akcji (action) i typu zasobu (resource_type)
- Może zawierać warunki (conditions) dla bardziej złożonych reguł
- Przykłady: "read:posts", "write:users", "delete:comments"

### RESOURCE (Resource)
- Definicja chronionego zasobu
- Może reprezentować różne typy obiektów w aplikacji
- Metadata pozwala na dodatkowe informacje kontekstowe

### ROLE_HIERARCHY (Role Hierarchy)
- Definiuje hierarchię między rolami
- inheritance_level określa poziom dziedziczenia
- Umożliwia tworzenie złożonych struktur organizacyjnych

## Przykłady uprawnień:

```javascript
// Podstawowe uprawnienia
"read:posts"     // Czytanie postów
"write:posts"    // Tworzenie/edycja postów
"delete:posts"   // Usuwanie postów
"admin:users"    // Pełne zarządzanie użytkownikami

// Uprawnienia z warunkami
{
  name: "edit:post",
  action: "edit",
  resource_type: "post",
  conditions: {
    owner_only: true,        // Tylko właściciel
    time_limit: "24h"        // W ciągu 24h od utworzenia
  }
}
```
