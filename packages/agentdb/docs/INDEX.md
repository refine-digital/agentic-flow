# AgentDB Documentation Index

## Getting Started

- [Main README](./README.md) - Overview and quick start
- [Migration Guide](./guides/MIGRATION_GUIDE.md) - Upgrade instructions
- [Troubleshooting](./guides/TROUBLESHOOTING.md) - Common issues and solutions

## Core Documentation

### Architecture Decision Records (ADRs)

- [ADR-002: RuVector WASM Integration](./adrs/ADR-002-ruvector-wasm-integration.md)
- [ADR-003: RVF Native Format Integration](./adrs/ADR-003-rvf-native-format-integration.md)

### Guides

- [SDK Guide](./guides/SDK_GUIDE.md) - Complete SDK reference
- [Frontier Memory Guide](./guides/FRONTIER_MEMORY_GUIDE.md) - Advanced memory patterns
- [Authentication](./guides/AUTHENTICATION.md) - Authentication guide
- [Embedding Models Guide](./guides/EMBEDDING-MODELS-GUIDE.md) - Embedding model selection
- [Neural Commands Quick Reference](./guides/NEURAL-COMMANDS-QUICK-REFERENCE.md) - Neural CLI commands
- [Observability Integration Guide](./guides/OBSERVABILITY_INTEGRATION_GUIDE.md) - Observability setup
- [Publishing Guide](./guides/PUBLISHING_GUIDE.md) - Package publishing
- [Browser V2 Migration](./guides/BROWSER_V2_MIGRATION.md) - Browser environment migration
- [Browser Advanced Features](./guides/BROWSER_ADVANCED_FEATURES_GAP_ANALYSIS.md)
- [Browser Usage Examples](./guides/BROWSER_ADVANCED_USAGE_EXAMPLES.md)
- [Browser V2 Plan](./guides/BROWSER_V2_PLAN.md)
- [Migration V2](./guides/MIGRATION_V2.md)

### Security

- [Security Audit Report](./security/SECURITY_AUDIT_REPORT.md) - Security audit findings
- [Security Fixes Summary](./security/SECURITY_FIXES_SUMMARY.md) - Applied security fixes
- [Security Guidelines](./security/SECURITY_GUIDELINES.md) - Security best practices
- [Security Implementation](./security/SECURITY_IMPLEMENTATION.md) - Security implementation details
- [Security README](./security/SECURITY_README.md) - Security overview

### Architecture

- [Backends](./architecture/BACKENDS.md) - Storage backend architecture
- [MCP Tools](./architecture/MCP_TOOLS.md) - Model Context Protocol integration
- [GNN Learning](./architecture/GNN_LEARNING.md) - Graph Neural Network features
- [Tool Design Specification](./architecture/TOOL_DESIGN_SPEC.md)
- [Specification Tools Design](./architecture/SPECIFICATION_TOOLS_DESIGN.md)
- [Skill Coordination Diagram](./architecture/skill-coordination-diagram.md) - Skill coordination flow

### Implementation Details

- [Core Tools Implementation](./implementation/CORE_TOOLS_IMPLEMENTATION.md)
- [MCP Integration](./implementation/MCP_INTEGRATION.md)
- [HNSW Implementation Complete](./implementation/HNSW-IMPLEMENTATION-COMPLETE.md)
- [HNSW Final Summary](./implementation/HNSW-FINAL-SUMMARY.md)
- [WASM Vector Acceleration](./implementation/WASM-VECTOR-ACCELERATION.md)
- [WASM Implementation Summary](./implementation/WASM-IMPLEMENTATION-SUMMARY.md)
- [Ruvector Backend Implementation](./implementation/RUVECTOR_BACKEND_IMPLEMENTATION.md)
- [Tools 6-10 Implementation](./implementation/TOOLS_6-10_IMPLEMENTATION.md)
- [Agentic Flow Integration Report](./implementation/AGENTIC_FLOW_INTEGRATION_REPORT.md)
- [CLI Enhancements (ADR-002)](./implementation/CLI-ENHANCEMENTS-ADR-002.md) - CLI improvements for ADR-002
- [CLI MCP Integration Status](./implementation/CLI-MCP-INTEGRATION-STATUS.md) - MCP integration progress
- [Cache Implementation](./implementation/CACHE_IMPLEMENTATION.md) - Caching layer details
- [Parallel Batch Insert](./implementation/PARALLEL_BATCH_INSERT.md) - Batch insert optimization
- [Observability](./implementation/OBSERVABILITY.md) - Observability implementation
- [Telemetry Setup Summary](./implementation/TELEMETRY_SETUP_SUMMARY.md) - Telemetry configuration
- [Query Cache](./implementation/query-cache.md) - Query caching
- [Type Safety Implementation](./implementation/type-safety-implementation.md) - Type safety patterns

### QUIC Synchronization

- [QUIC Index](./quic/QUIC-INDEX.md) - Overview of QUIC features
- [QUIC Architecture](./quic/QUIC-ARCHITECTURE.md)
- [QUIC Architecture Diagrams](./quic/QUIC-ARCHITECTURE-DIAGRAMS.md)
- [QUIC Implementation Roadmap](./quic/QUIC-IMPLEMENTATION-ROADMAP.md)
- [QUIC Research](./quic/QUIC-RESEARCH.md)
- [QUIC Sync Implementation](./quic/QUIC-SYNC-IMPLEMENTATION.md)
- [QUIC Sync Test Suite](./quic/QUIC-SYNC-TEST-SUITE.md)
- [QUIC Quality Analysis](./quic/QUIC-QUALITY-ANALYSIS.md)

## Reports & Analysis

### Performance Reports

- [Optimization Report](./reports/OPTIMIZATION-REPORT.md)
- [Performance Benchmarks](./reports/PERFORMANCE-BENCHMARKS.md) - Benchmark results
- [Performance Report](./reports/PERFORMANCE-REPORT.md)
- [Batch Optimization Results](./reports/BATCH-OPTIMIZATION-RESULTS.md)
- [MCP Optimization Summary](./reports/MCP-OPTIMIZATION-SUMMARY.md)
- [Browser V2 Optimization Report](./reports/BROWSER_V2_OPTIMIZATION_REPORT.md)

### Implementation Reports

- [Implementation Complete Final](./reports/IMPLEMENTATION_COMPLETE_FINAL.md)
- [Browser Features Implementation Summary](./reports/BROWSER_FEATURES_IMPLEMENTATION_SUMMARY.md)
- [Browser Advanced Features Complete](./reports/BROWSER_ADVANCED_FEATURES_COMPLETE.md)
- [Minification Fix Complete](./reports/MINIFICATION_FIX_COMPLETE.md)

### Validation Reports

- [Alpha Release Issue](./validation/ALPHA_RELEASE_ISSUE.md) - Alpha release tracking
- [Alpha Validation Report](./validation/ALPHA_VALIDATION_REPORT.md) - Alpha validation
- [Alpha Validation Summary](./validation/ALPHA_VALIDATION_SUMMARY.md) - Alpha validation summary
- [Validation Complete](./validation/VALIDATION-COMPLETE.md) - Validation completion record
- [Validation Report](./reports/VALIDATION-REPORT.md)
- [Validation Summary](./validation/VALIDATION-SUMMARY.md)
- [Browser V2 Test Results](./validation/BROWSER_V2_TEST_RESULTS.md)
- [CLI Validation Results](./validation/CLI-VALIDATION-RESULTS.md)
- [CLI Test Report](./validation/CLI_TEST_REPORT.md)
- [NPX Validation Report](./validation/NPX-VALIDATION-REPORT.md)
- [Hooks Validation Report](./validation/HOOKS_VALIDATION_REPORT.md)
- [Comprehensive Regression Analysis](./validation/agentdb-comprehensive-regression-analysis.md)
- [Deployment Report V1.6.1](./validation/DEPLOYMENT-REPORT-V1.6.1.md)

## Current Status

### Production Status (current-status/)

- [Final Production Readiness Report](./current-status/FINAL_PRODUCTION_READINESS_REPORT_2025-11-29.md) - Latest production status
- [Phase 2 MCP Optimization Review](./current-status/PHASE-2-MCP-OPTIMIZATION-REVIEW.md) - MCP optimization status
- [MCP Tool Optimization Guide](./current-status/MCP_TOOL_OPTIMIZATION_GUIDE.md) - Performance tuning guide

### Implementation Details

- [WASM Vector README](./implementation/WASM-VECTOR-README.md) - WASM acceleration overview

### Validation Status

- [Validation Summary README](./validation/VALIDATION-SUMMARY-README.md) - Test coverage overview
- [CLI Deep Validation Report](./validation/CLI-DEEP-VALIDATION-REPORT.md) - Comprehensive CLI testing

## Release Notes

### Alpha Changelogs

- [Changelog Alpha 2.5](./releases/CHANGELOG-ALPHA-2.5.md)
- [Changelog Alpha 2.6](./releases/CHANGELOG-ALPHA-2.6.md)
- [Changelog Alpha 2.7](./releases/CHANGELOG-ALPHA-2.7.md)

### Current Releases

- [V2 Alpha Release](./releases/V2_ALPHA_RELEASE.md)
- [Release V2 Summary](./releases/RELEASE_V2_SUMMARY.md)
- [Release v1.6.0 Final Release Summary](./releases/V1.6.0-FINAL-RELEASE-SUMMARY.md)
- [V1.6.0 Migration](./releases/V1.6.0_MIGRATION.md)
- [V1.6.0 Quick Start](./releases/V1.6.0_QUICK_START.md)
- [V1.7.0 Regression Report](./releases/V1.7.0-REGRESSION-REPORT.md)
- [Updated Features](./releases/updated-features.md)

### V1.6.0 Release Documentation

- [V1.6.0 Implementation Summary](./releases/V1.6.0_IMPLEMENTATION_SUMMARY.md)
- [V1.6.0 Comprehensive Validation](./releases/V1.6.0_COMPREHENSIVE_VALIDATION.md)
- [V1.6.0 Feature Accuracy Report](./releases/V1.6.0_FEATURE_ACCURACY_REPORT.md)
- [V1.6.0 Final Status Report](./releases/V1.6.0_FINAL_STATUS_REPORT.md)
- [V1.6.0 Vector Search Validation](./releases/V1.6.0_VECTOR_SEARCH_VALIDATION.md)

### V1.5.x Releases

- [V1.5.0 Action Plan](./releases/V1.5.0_ACTION_PLAN.md)
- [V1.5.0 Validation Report](./releases/V1.5.0_VALIDATION_REPORT.md)
- [V1.5.8 Hooks CLI Commands](./releases/V1.5.8_HOOKS_CLI_COMMANDS.md)
- [V1.5.9 Transaction Fix](./releases/V1.5.9_TRANSACTION_FIX.md)

### General Release Documentation

- [Final Release Report](./releases/FINAL_RELEASE_REPORT.md)
- [Final Validation Report](./releases/FINAL-VALIDATION-REPORT.md)
- [Implementation Summary](./releases/IMPLEMENTATION_SUMMARY.md)
- [NPM Release Ready](./releases/NPM_RELEASE_READY.md)
- [Release Checklist](./releases/RELEASE_CHECKLIST.md)
- [Release Confirmation](./releases/RELEASE_CONFIRMATION.md)
- [Release Ready](./releases/RELEASE_READY.md)
- [Release Summary](./releases/SUMMARY.md)
- [Test Suite Summary](./releases/TEST_SUITE_SUMMARY.md)
- [Test Summary](./releases/TEST_SUMMARY.md)

## Research

- [GNN Attention Vector Search Analysis](./research/gnn-attention-vector-search-comprehensive-analysis.md)
- [RuVector Attention Integration](./research/RUVECTOR-ATTENTION-INTEGRATION.md) - Attention mechanism integration
- [RuVector Attention Source Code Analysis](./research/RUVECTOR-ATTENTION-SOURCE-CODE-ANALYSIS.md) - Source code analysis
- [RuVector Capabilities Validated](./research/RUVECTOR-CAPABILITIES-VALIDATED.md) - Capability validation
- [RuVector Graph Database](./research/RUVECTOR-GRAPH-DATABASE.md) - Graph database research
- [RuVector Integration V2](./research/RUVECTOR-INTEGRATION-V2.md) - V2 integration research

## Legacy Documentation

The following documentation has been archived but may be useful for historical reference:

- [Legacy Documentation](./legacy/) - Older documentation and historical fixes

## Archives

- [Session Reports](./archive/sessions/) - Development session summaries
- [Review Documents](./archive/reviews/) - Code reviews and audits
- [Old Releases](./archive/old-releases/) - Historical release documentation

---

**Last Updated:** 2026-02-16

For the latest information, always check the main [README](./README.md) and [Release Notes](./releases/).
