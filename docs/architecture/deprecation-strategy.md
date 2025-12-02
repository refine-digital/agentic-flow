# Agentic-Flow v1.x Deprecation Strategy and Timeline

**Document Version**: 1.0.0
**Date**: 2025-12-02
**Status**: Approved
**Next Review**: 2026-06-02 (6 months)

---

## Executive Summary

This document defines the deprecation strategy and timeline for Agentic-Flow v1.x APIs as we transition to v2.0. The strategy prioritizes user experience, backwards compatibility, and gradual migration with clear communication and extensive tooling support.

### Core Principles

1. **No Breaking Changes**: v1.x APIs will continue to work indefinitely
2. **Gradual Warnings**: Deprecation warnings increase in severity over time
3. **Tooling First**: Automated migration tools provided before enforcement
4. **Community Driven**: Timeline adjusts based on user feedback and adoption rates
5. **Long-Term Support**: v1.x compatibility maintained for minimum 2 years

---

## Deprecation Philosophy

### "Soft Deprecation" Approach

We adopt a **soft deprecation** model where v1.x APIs are marked as deprecated but never removed:

```
v1.x APIs → Deprecated but functional → Forever supported
                                      ↓
                                  Compatibility Layer
                                      ↓
                                  v2.0 Backend
```

This differs from traditional "hard deprecation" where APIs are eventually removed.

### Rationale

1. **Enterprise Stability**: Large codebases can't migrate instantly
2. **Backwards Compatibility**: No forced upgrades or breaking changes
3. **Gradual Adoption**: Users migrate on their schedule
4. **Risk Mitigation**: Failed migrations can fall back to v1.x

---

## Deprecation Timeline

### Phase 1: Silent Support (Current - v2.0.0-alpha)

**Duration**: Alpha period (2-3 months)
**Status**: In progress

**Characteristics**:
- v1.x APIs work without warnings (opt-in warnings via config)
- Full backwards compatibility tested
- Migration guides published
- Automated migration tools available

**User Action Required**: None

**Example**:
```typescript
// Works silently
const flow = new AgenticFlow();
await flow.initSwarm({ topology: 'mesh' });
```

---

### Phase 2: Soft Warnings (v2.0.0-beta)

**Duration**: Beta period (1-2 months)
**Start Date**: Approximately March 2026

**Characteristics**:
- v1.x APIs emit deprecation warnings by default
- Warnings include migration instructions
- Performance metrics show v2.0 improvements
- Community migration success stories shared

**User Action Required**: Review warnings, plan migration

**Example**:
```typescript
const flow = new AgenticFlow();
await flow.initSwarm({ topology: 'mesh' });

// Console output:
// ⚠️  WARNING: initSwarm() is deprecated
// Migration: await flow.swarms.create({ topology: 'mesh' })
// Benefits: 150x faster with AgentDB v2
// Docs: https://agentic-flow.dev/migration#init-swarm
```

**Disabling Warnings**:
```typescript
const flow = new AgenticFlow({ deprecationWarnings: false });
```

---

### Phase 3: Prominent Warnings (v2.0.0 Stable)

**Duration**: 6 months after stable release
**Start Date**: Approximately May 2026

**Characteristics**:
- Warnings include deprecation timeline
- CLI shows migration progress percentage
- Automatic migration suggestions in IDE
- Quarterly deprecation reports via email (opt-in)

**User Action Required**: Begin migration planning

**Example**:
```typescript
const flow = new AgenticFlow();
await flow.initSwarm({ topology: 'mesh' });

// Console output:
// ╔════════════════════════════════════════════════════════════╗
// ║  DEPRECATION WARNING: initSwarm()                           ║
// ╠════════════════════════════════════════════════════════════╣
// ║  This API is deprecated and will be phased out by Nov 2026 ║
// ║                                                             ║
// ║  Migration: flow.swarms.create({ topology: 'mesh' })       ║
// ║  Benefits: 150x faster, GNN learning, causal reasoning     ║
// ║  Tool: npx agentic-flow migrate ./src                      ║
// ║                                                             ║
// ║  Docs: https://agentic-flow.dev/migration                  ║
// ╚════════════════════════════════════════════════════════════╝
```

---

### Phase 4: Long-Term Support (v2.1.0+)

**Duration**: Indefinite (minimum 2 years)
**Start Date**: Approximately November 2026

**Characteristics**:
- v1.x APIs continue to work
- Warnings remain but are less intrusive
- v1.x compatibility layer maintained
- Security updates continue for v1.x APIs
- New features only in v2.0 API

**User Action Required**: Complete migration for new features

**Example**:
```typescript
const flow = new AgenticFlow();
// Still works, minimal warning shown once per session
```

---

## Warning Severity Levels

### Level 1: Info (Alpha)

```
ℹ️  INFO: v2.0 API available for this operation
Recommendation: Consider migrating to v2.0 for better performance
```

### Level 2: Warning (Beta)

```
⚠️  WARNING: v1.x API deprecated
This API will enter LTS mode in 6 months
```

### Level 3: Deprecation (Stable)

```
🚨 DEPRECATION: v1.x API in LTS mode
New features only available in v2.0
Migration tool: npx agentic-flow migrate
```

### Level 4: LTS (v2.1.0+)

```
📌 LTS MODE: v1.x API
Maintained for compatibility only
Migrate to v2.0 for new features
```

---

## Automated Migration Tools

### CLI Migration Command

```bash
# Analyze codebase for v1.x usage
npx agentic-flow analyze ./src

# Output:
# 📊 Migration Analysis Report
# ═══════════════════════════════════════
# v1.x APIs Found: 37
#   - initSwarm: 5 occurrences
#   - spawnAgent: 12 occurrences
#   - orchestrateTask: 8 occurrences
#   - getMemory/setMemory: 12 occurrences
#
# Estimated Migration Time: 2-3 hours
# Automatic Migration: 95% success rate
# Manual Review Required: 2 cases
#
# Next Steps:
# 1. Run: npx agentic-flow migrate ./src --dry-run
# 2. Review: git diff
# 3. Apply: npx agentic-flow migrate ./src --apply

# Dry-run migration
npx agentic-flow migrate ./src --dry-run

# Apply migration
npx agentic-flow migrate ./src --apply

# Interactive migration
npx agentic-flow migrate ./src --interactive
```

### VSCode Extension

```typescript
// Inline migration suggestions
const flow = new AgenticFlow();
await flow.initSwarm({ topology: 'mesh' });
//           ~~~~~~~~
// 💡 Quick Fix: Migrate to v2.0 API
//    → await flow.swarms.create({ topology: 'mesh' })
```

### Git Codemod

```bash
# Automated codemod using jscodeshift
npx @agentic-flow/codemod v1-to-v2 ./src

# Creates migration branch and pull request
git checkout -b migrate-to-v2
# ... codemod runs ...
git add .
git commit -m "feat: Migrate from v1.x to v2.0 API"
gh pr create --title "Migrate to Agentic-Flow v2.0" --body "$(cat MIGRATION_REPORT.md)"
```

---

## Communication Strategy

### 1. Documentation

**Migration Guide** (`/docs/migration/v1-to-v2.md`):
- Complete API mapping reference
- Step-by-step migration instructions
- Common pitfalls and solutions
- Performance improvement case studies
- FAQ

**Changelog** (`CHANGELOG.md`):
- Deprecation announcements in every release
- Migration resources highlighted
- Community migration stories

**README** (`README.md`):
- Prominent v2.0 feature showcase
- Migration guide link in header
- Performance comparison table

### 2. In-Application

**Startup Banner** (v2.0.0-beta onward):
```
╔════════════════════════════════════════════════════════════╗
║  Agentic-Flow v2.0.0-beta                                   ║
║  Using v1.x APIs - migration recommended                   ║
║  Run: npx agentic-flow migrate                             ║
║  Docs: https://agentic-flow.dev/migration                  ║
╚════════════════════════════════════════════════════════════╝
```

**Migration Progress Indicator**:
```bash
$ npx agentic-flow status

Migration Status: 60% complete
═══════════════════════════════════════
✅ Migrated APIs: 23
⚠️  Remaining v1.x APIs: 14
📖 Migration Guide: https://...

Next Steps:
1. Review remaining v1.x usage
2. Run migration tool
3. Update tests
```

### 3. Community Channels

**Discord Announcements**:
- Deprecation timeline announcements
- Migration workshop events
- Q&A sessions with maintainers

**Blog Posts**:
- "Introducing Agentic-Flow v2.0"
- "Migration Guide: v1.x to v2.0"
- "Performance Benchmarks: 150x Faster"
- "Community Migration Success Stories"

**Email Notifications** (opt-in):
- Quarterly deprecation reports
- Migration tips and best practices
- New tool releases

### 4. Package Manager

**npm Deprecation Warnings**:
```bash
# For v1.x only package (if released separately)
npm deprecate agentic-flow@1.x "v1.x is in LTS mode. Migrate to v2.0 for new features"
```

---

## Metrics and Success Criteria

### Migration Adoption Metrics

Track via anonymous telemetry (opt-in):

| Metric | Target | Current | Timeline |
|--------|--------|---------|----------|
| v2.0 adoption rate | 50% | TBD | 6 months |
| v2.0 adoption rate | 80% | TBD | 12 months |
| v1.x API usage | <20% | TBD | 12 months |
| Migration tool usage | 60% | TBD | 6 months |
| Deprecation awareness | 90% | TBD | 3 months |

### Community Feedback Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Migration satisfaction | >80% positive | Surveys |
| Support ticket volume | <5% increase | GitHub Issues |
| Breaking change reports | 0 | GitHub Issues |
| Migration success rate | >95% | Telemetry (opt-in) |

---

## Rollback and Support

### Rollback Options

Users can rollback at any time:

**Option 1: Package Version**
```bash
npm install agentic-flow@1.x
```

**Option 2: Environment Variable**
```bash
export AGENTIC_FLOW_VERSION=1
```

**Option 3: Code Configuration**
```typescript
const flow = new AgenticFlow({ version: '1.x' });
```

### Support Guarantees

| Support Type | v1.x LTS | v2.0 |
|-------------|---------|------|
| Bug fixes | ✅ 2 years minimum | ✅ Ongoing |
| Security patches | ✅ 2 years minimum | ✅ Ongoing |
| New features | ❌ No | ✅ Yes |
| Performance improvements | ⚠️ Critical only | ✅ Ongoing |
| Documentation | ✅ Maintained | ✅ Expanded |
| Community support | ✅ Active | ✅ Active |

---

## FAQ

### Will v1.x APIs be removed?

**No.** v1.x APIs will be maintained indefinitely via the compatibility layer. "Deprecation" means we recommend migrating, not that the APIs will stop working.

### What if I can't migrate immediately?

You can continue using v1.x APIs without issue. You may:
1. Disable deprecation warnings
2. Stay on v1.x package version
3. Migrate incrementally over months/years

### Will there be breaking changes?

**No.** All v1.x code will continue to work on v2.0 backend with zero breaking changes.

### What's the benefit of migrating?

- 150x faster vector search
- 10x faster agent spawning
- Access to new features (GNN learning, attention mechanisms, causal reasoning)
- Better performance and memory efficiency
- Active feature development

### Can I use v1.x and v2.0 APIs together?

**Yes.** The compatibility layer allows mixing APIs:

```typescript
const flow = new AgenticFlow();

// v1.x API
await flow.initSwarm({ topology: 'mesh' });

// v2.0 API
const result = await flow.memory.vectorSearch('query', { k: 10 });
```

### How do I test migration before committing?

```bash
# 1. Analyze
npx agentic-flow analyze ./src

# 2. Dry-run
npx agentic-flow migrate ./src --dry-run

# 3. Review diff
git diff

# 4. Run tests on migrated code
npm test

# 5. Rollback if needed
git checkout .
```

---

## Timeline Summary

```
2025-12-02  │ v2.0.0-alpha released
            │ ├─ v1.x works silently (opt-in warnings)
            │ ├─ Migration guides published
            │ └─ Automated tools available
            │
2026-03-01  │ v2.0.0-beta released
            │ ├─ Soft warnings enabled by default
            │ ├─ Migration workshops begin
            │ └─ Community success stories shared
            │
2026-05-01  │ v2.0.0 stable released
            │ ├─ Prominent deprecation warnings
            │ ├─ 6-month migration window begins
            │ └─ Quarterly migration reports
            │
2026-11-01  │ LTS period begins
            │ ├─ v1.x APIs remain functional
            │ ├─ Security updates continue
            │ ├─ New features v2.0 only
            │ └─ Migration encouraged but optional
            │
2028-11-01  │ Review LTS continuation
            │ ├─ Evaluate v1.x usage metrics
            │ ├─ Community feedback assessment
            │ └─ Extend LTS if needed
```

---

## Governance and Adjustments

This deprecation timeline is **subject to adjustment** based on:

1. **User Feedback**: If migration is harder than expected, extend timelines
2. **Adoption Rates**: If <50% adoption at 6 months, extend soft warning period
3. **Critical Issues**: If v2.0 has stability issues, pause deprecation warnings
4. **Community Requests**: Open to extending LTS period based on need

**Review Schedule**: Quarterly reviews of deprecation metrics and community feedback

**Amendment Process**: Publish updated timelines 60 days before enforcement changes

---

## References

1. **Migration Guide**: `/docs/migration/v1-to-v2-guide.md`
2. **API Compatibility**: `/docs/architecture/v1-v2-compatibility.md`
3. **CHANGELOG**: `/CHANGELOG.md`
4. **Epic**: `/.github/ISSUE_TEMPLATE/epic-v2-implementation.md`

---

**Document Status**: Approved
**Approvers**: Technical Lead, Product Owner, Community Manager
**Next Review**: 2026-06-02
**Version History**:
- v1.0.0 (2025-12-02): Initial deprecation strategy
