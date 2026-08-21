# ADR-001 — Application Architecture

**Date:** 2026-08-20
**Status:** Accepted

## Context

A senior-level React Native challenge requires demonstrating architectural judgment. The feature has a domain with genuine business rules, a WebView integration boundary, global state management, and a native library requirement.

## Decision

Lean Clean Architecture + DDD tactical patterns over full hexagonal architecture.

Three layers with strict inward dependency direction:
1. **Domain** — entities, value objects, business rules, domain events. Zero external dependencies.
2. **Application** — use cases. Depends only on domain and repository interface (port).
3. **Infrastructure + Presentation** — Redux, repository implementation, WebView adapter, React components.

## Why

- Full hexagonal (explicit port interfaces per dependency) adds ceremony with no benefit for a three-use-case feature
- DDD makes business rules explicit and independently testable
- Dependency inversion is achieved via TypeScript interfaces without an IoC container

## Alternatives Considered

| Alternative | Rejected because |
|-------------|-----------------|
| Full hexagonal ports-and-adapters | Over-engineered for scope; adds port files with no behaviour |
| Flat architecture (everything in components) | Business rules would leak into UI; untestable |
| Feature-sliced design | Good for large teams; overkill for single-feature challenge |

## Trade-offs

- Convention-enforced boundaries (no compiler enforces layer separation) — mitigated by code review and clear folder structure
- Singleton repository in hook — acceptable for demo, not for production

## Consequences

Domain can be tested without React Native. Swapping the repository or state management requires changes only in the infrastructure layer.
