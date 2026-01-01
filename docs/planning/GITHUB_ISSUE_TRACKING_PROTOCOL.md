# GitHub Issue Tracking Protocol - RuVector Integration

## 🎯 Overview

This protocol defines how agents maintain GitHub issues throughout the 23-day RuVector integration project.

---

## 📋 Issue Structure

### Master Issue

**Title**: `[INTEGRATION] RuVector Ecosystem Integration - 23-Day Timeline`

**Labels**: `enhancement`, `integration`, `epic`

**Structure**:
```markdown
## 🎯 Mission

Integrate RuVector ecosystem (ruvector, ruv-tensor, ruvllm, ruvdb, SONA) into AgentDB and Agentic-Flow packages.

## 📊 Timeline

**Duration**: 23 days (Days 0-23)
**Critical Checkpoint**: Day 12 - AgentDB v2.0.0 Publication

## 🔗 Related Documents

- [Swarm Execution Plan](/docs/planning/SWARM_EXECUTION_PLAN.md)
- [Agent Coordination Matrix](/docs/planning/AGENT_COORDINATION_MATRIX.md)
- [Master Timeline](/docs/planning/MASTER_TIMELINE.md)

## 📈 Overall Progress

- [ ] Phase 0: Foundation (Day 0) - 0%
- [ ] Phase 1: Core AgentDB Updates (Days 1-3) - 0%
- [ ] Phase 2: PostgreSQL Backend (Days 4-7) - 0%
- [ ] Phase 3: Advanced Database Features (Days 8-11) - 0%
- [ ] Phase 4: AgentDB Publication (Day 12) - 0%
- [ ] Phase 5: Agentic-Flow Orchestration (Days 13-16) - 0%
- [ ] Phase 6: Advanced Orchestration (Days 17-19) - 0%
- [ ] Phase 7: Integration Testing (Days 20-22) - 0%
- [ ] Phase 8: Final Release (Day 23) - 0%

## 🚨 Current Blockers

_None (updated daily)_

## 📊 Metrics

- **Tests Written**: 0 / 500+
- **Test Coverage**: TBD / 80%+
- **Performance vs Baseline**: TBD / ±5%
- **Documentation Pages**: 0 / 20+

## 🔄 Recent Updates

_Updates posted daily by Project Coordinator_

---

**Last Updated**: 2025-12-30 by Project Coordinator
**Current Phase**: Phase 0 - Foundation
**Next Checkpoint**: End of Day 0
```

### Phase Issues (9 total)

Create one issue per phase linking to the master issue.

**Naming Convention**: `[PHASE-X] <Phase Name> - Days X-Y`

**Example - Phase 1**:
```markdown
**Title**: [PHASE-1] Core AgentDB Updates - Days 1-3

**Labels**: `phase-1`, `agentdb`, `integration`

**Linked Issues**:
- Master: #XXX [INTEGRATION] RuVector Ecosystem Integration

## 🎯 Phase Objective

Update AgentDB dependencies and integrate RuVector core.

## 📋 Work Streams

### Stream 1A: Dependency Updates (8h)
**Agents**: Backend Developer, CI/CD Engineer
- [ ] Update ruvector to v0.1.30
- [ ] Update ruv-tensor to v0.1.31
- [ ] Update ruvllm to v0.1.31
- [ ] Run dependency audit
- [ ] Fix breaking changes

**Progress**: 0% | **Assigned**: @backend-dev, @cicd-engineer

### Stream 1B: Core Integration (16h)
**Agents**: Backend Developer, ML Developer
- [ ] Integrate RuVector core into lib/agentdb.js
- [ ] Replace old vector operations
- [ ] Update memory management
- [ ] Optimize WASM loading

**Progress**: 0% | **Assigned**: @backend-dev, @ml-developer

### Stream 1C: Testing Foundation (12h)
**Agents**: TDD Tester, Integration Tester
- [ ] Create test suite
- [ ] Write 50+ unit tests
- [ ] Set up integration framework
- [ ] Create benchmark baseline

**Progress**: 0% | **Assigned**: @tdd-tester, @integration-tester

### Stream 1D: Documentation (6h)
**Agents**: API Documentation
- [ ] Update API documentation
- [ ] Document breaking changes
- [ ] Create migration guide v0.1
- [ ] Update code examples

**Progress**: 0% | **Assigned**: @api-docs

## 📊 Phase Metrics

- **Tests**: 0 / 50+
- **Coverage**: TBD / 80%+
- **Performance**: TBD / ±5% of baseline

## 🚨 Blockers

_None_

## 📅 Timeline

- **Start**: Day 1 (2025-12-31)
- **End**: Day 3 (2026-01-02)
- **Checkpoint**: End of Day 3

## 🔄 Daily Updates

### Day 1 - 2025-12-31
_No updates yet_

### Day 2 - 2026-01-01
_Pending_

### Day 3 - 2026-01-02
_Pending_

---

**Last Updated**: 2025-12-30 by Project Coordinator
**Status**: Not Started
```

---

## 🔄 Update Frequency & Timing

### Daily Updates (Every Working Day)

**Who**: Project Coordinator
**When**: End of day (6-8 PM local time)
**Where**: Master issue + current phase issue

**Content**:
```markdown
### Day X - YYYY-MM-DD

**Completed Today**:
- ✅ Stream 1A: Dependency updates complete (backend-dev, cicd-engineer)
- ✅ Stream 1B: 40% core integration (backend-dev, ml-developer)
- 🔄 Stream 1C: 30% test suite (tdd-tester, integration-tester)

**In Progress**:
- Stream 1B: RuVector core integration (60% remaining)
- Stream 1C: Unit tests and integration framework (70% remaining)
- Stream 1D: API documentation (100% remaining, starts Day 2)

**Blockers**:
- None

**Metrics**:
- Tests: 15 / 50+ (30%)
- Coverage: 65% / 80%
- Performance: TBD (benchmarking pending)

**Tomorrow's Focus**:
- Complete core integration (Stream 1B)
- Finish test suite (Stream 1C)
- Begin API documentation (Stream 1D)

**Agent Status**:
- @backend-dev: On track (7.5h today)
- @ml-developer: On track (6h today)
- @tdd-tester: On track (5h today)
- @integration-tester: On track (4h today)

---
_Posted by Project Coordinator at 2025-12-31 19:00_
```

### Checkpoint Updates (End of Each Phase)

**Who**: Project Coordinator + Lead Dev Agent
**When**: Within 4 hours of phase completion
**Where**: Phase issue + master issue

**Content**:
```markdown
## 🎉 Phase 1 Checkpoint - COMPLETE

**Completion Date**: 2026-01-02 (Day 3)
**Overall Status**: ✅ SUCCESS

### ✅ Deliverables

**Stream 1A: Dependency Updates** - COMPLETE
- ✅ All dependencies updated to latest versions
- ✅ Dependency audit passed (0 vulnerabilities)
- ✅ Breaking changes documented and resolved

**Stream 1B: Core Integration** - COMPLETE
- ✅ RuVector core fully integrated into lib/agentdb.js
- ✅ Old vector operations replaced with RuVector API
- ✅ Memory management updated
- ✅ WASM optimization applied (20% memory reduction)

**Stream 1C: Testing Foundation** - COMPLETE
- ✅ 52 unit tests created (target: 50+)
- ✅ Integration test framework operational
- ✅ Baseline benchmarks recorded

**Stream 1D: Documentation** - COMPLETE
- ✅ API documentation updated
- ✅ Breaking changes documented
- ✅ Migration guide v0.1 published
- ✅ 12 code examples updated

### 📊 Final Metrics

- **Tests**: 52 / 50+ (104% of target) ✅
- **Coverage**: 82% / 80% (102% of target) ✅
- **Performance**: -3% vs baseline (within ±5% target) ✅
- **Code Review**: Approved by @code-reviewer ✅

### 🎯 Quality Gates

- ✅ All tests passing (100% success rate)
- ✅ Code review approved
- ✅ Performance benchmarks within targets
- ✅ Documentation complete and accurate

### 📈 Impact on Timeline

**Status**: ON SCHEDULE
- Planned: Days 1-3
- Actual: Days 1-3
- Variance: 0 days

### 🚀 Next Phase

**Phase 2**: PostgreSQL Backend Integration
- **Start**: Day 4 (2026-01-03)
- **End**: Day 7 (2026-01-06)
- **Lead Agents**: @database-architect, @backend-dev

### 🎓 Lessons Learned

**What Went Well**:
- Tight collaboration between backend-dev and ml-developer
- Early testing prevented integration issues
- Clear memory namespaces reduced coordination overhead

**Improvements for Next Phase**:
- Start documentation earlier (was rushed at end)
- More frequent performance checks (don't wait until end)
- Better estimation for WASM optimization (took longer than expected)

---
_Posted by Project Coordinator at 2026-01-02 20:00_
```

### Blocker Updates (Real-Time)

**Who**: Any agent
**When**: Within 1 hour of discovery
**Where**: Current phase issue + master issue

**Process**:
1. Agent discovers blocker
2. Store in `swarm/global/blockers/blocker-[id].json`
3. Notify Project Coordinator via hooks
4. Project Coordinator posts to GitHub within 1 hour

**Content**:
```markdown
## 🚨 BLOCKER - Day X

**Discovered**: 2026-01-05 14:30 by @database-architect
**Severity**: HIGH
**Impact**: May delay Phase 2 by 1 day

### Issue Description

PostgreSQL migration tool fails on databases >10GB due to memory constraints.

### Affected Work Streams

- Stream 2C: Data Migration Tools (blocked)
- Stream 2D: Testing & Validation (blocked)

### Root Cause

Attempting to load entire database into memory before migration. Need to implement streaming approach.

### Proposed Solution

1. Implement streaming migration (batch size: 1000 records)
2. Add progress tracking and resumability
3. Increase estimated time from 12h to 16h

### Timeline Impact

- **Original**: Complete Day 6
- **Revised**: Complete Day 7 (1 day slip)
- **Mitigation**: Compress Stream 2D by overlapping with Stream 2C

### Action Items

- [ ] @database-architect: Implement streaming migration (4h)
- [ ] @backend-dev: Add progress tracking (2h)
- [ ] @tdd-tester: Update test expectations (1h)

### Status Updates

**2026-01-05 14:30** - Blocker discovered and reported
**2026-01-05 16:00** - Team aligned on streaming approach
**2026-01-05 18:00** - Streaming implementation 50% complete
**2026-01-06 10:00** - ✅ RESOLVED - Streaming migration working, tested with 50GB database

---
_Last Updated by Project Coordinator at 2026-01-06 10:30_
```

---

## 📊 Progress Tracking

### Progress Updates (Daily)

Update phase issue task lists using GitHub's task syntax:

```markdown
### Stream 1A: Dependency Updates (8h)
- [x] Update ruvector to v0.1.30
- [x] Update ruv-tensor to v0.1.31
- [x] Update ruvllm to v0.1.31
- [x] Run dependency audit
- [x] Fix breaking changes

**Progress**: 100% ✅ | **Assigned**: @backend-dev, @cicd-engineer
```

### Percentage Calculation

**Formula**: `(Completed Tasks / Total Tasks) * 100`

Update daily in phase issues:
```markdown
## 📊 Phase Metrics

- **Overall Progress**: 65% (13/20 tasks complete)
- **Stream 1A**: 100% ✅
- **Stream 1B**: 75% (3/4 tasks)
- **Stream 1C**: 50% (3/6 tasks)
- **Stream 1D**: 0% (not started)
```

### Visual Progress Indicators

Use emojis for quick status:
- ✅ Complete
- 🔄 In Progress
- ⏸️ Paused
- ❌ Blocked
- ⏭️ Not Started

```markdown
**Stream Status**:
- Stream 1A: ✅ Complete
- Stream 1B: 🔄 In Progress (75%)
- Stream 1C: 🔄 In Progress (50%)
- Stream 1D: ⏭️ Not Started
```

---

## 🏷️ Label System

### Standard Labels

**Phase Labels** (9 total):
- `phase-0` - Foundation
- `phase-1` - Core AgentDB Updates
- `phase-2` - PostgreSQL Backend
- `phase-3` - Advanced Database Features
- `phase-4` - AgentDB Publication
- `phase-5` - Agentic-Flow Orchestration
- `phase-6` - Advanced Orchestration
- `phase-7` - Integration Testing
- `phase-8` - Final Release

**Package Labels**:
- `agentdb` - AgentDB package work
- `agentic-flow` - Agentic-Flow package work
- `ruvector` - RuVector integration
- `documentation` - Documentation work

**Priority Labels**:
- `priority-critical` - Blocks publication or other work
- `priority-high` - Important for timeline
- `priority-medium` - Standard work
- `priority-low` - Nice to have

**Status Labels**:
- `status-not-started` - Not yet begun
- `status-in-progress` - Active work
- `status-blocked` - Waiting on dependency
- `status-review` - Code review in progress
- `status-complete` - Finished

**Type Labels**:
- `integration` - Integration work
- `testing` - Testing and validation
- `performance` - Performance optimization
- `security` - Security review
- `bug` - Bug fix

### Label Usage Rules

1. **Every issue must have**:
   - Exactly 1 phase label
   - At least 1 package label
   - Exactly 1 priority label
   - Exactly 1 status label

2. **Update status labels daily** as work progresses

3. **Add blocker label** (`priority-critical`) if issue is blocking

---

## 🔗 Issue Linking

### Parent-Child Relationships

**Master Issue** (#XXX)
  ├─ **Phase 0** (#XXX+1)
  ├─ **Phase 1** (#XXX+2)
  │   ├─ Stream 1A (tracked in comments)
  │   ├─ Stream 1B (tracked in comments)
  │   ├─ Stream 1C (tracked in comments)
  │   └─ Stream 1D (tracked in comments)
  ├─ **Phase 2** (#XXX+3)
  ├─ ... (phases 3-8)

### Link Syntax

In phase issues, link to master:
```markdown
**Parent Issue**: #XXX [INTEGRATION] RuVector Ecosystem Integration
```

In master issue, link to all phases:
```markdown
## 🔗 Phase Issues

- #XXX+1 [PHASE-0] Foundation
- #XXX+2 [PHASE-1] Core AgentDB Updates
- #XXX+3 [PHASE-2] PostgreSQL Backend
- ... (phases 3-8)
```

### Cross-Referencing

When mentioning related work:
```markdown
This work depends on the schema design from #XXX+3 (Phase 2).
```

---

## 📅 Milestone Management

### Create 3 Milestones

**Milestone 1: AgentDB v2.0.0**
- **Due Date**: Day 12 (Phase 4 completion)
- **Linked Issues**: Phases 0-4
- **Description**: Publish AgentDB with full RuVector integration

**Milestone 2: Agentic-Flow v2.0.0 Beta**
- **Due Date**: Day 19 (Phase 6 completion)
- **Linked Issues**: Phases 5-6
- **Description**: Agentic-Flow orchestration features complete

**Milestone 3: Full Integration Release**
- **Due Date**: Day 23 (Phase 8 completion)
- **Linked Issues**: Phases 7-8
- **Description**: Final release with complete integration

### Milestone Updates

Update milestone progress in master issue:
```markdown
## 🎯 Milestone Progress

**Milestone 1: AgentDB v2.0.0** (Due: Day 12)
- Progress: 45% (Phases 0-1 complete, Phase 2 in progress)
- Status: ON TRACK

**Milestone 2: Agentic-Flow v2.0.0 Beta** (Due: Day 19)
- Progress: 0% (blocked by Milestone 1)
- Status: NOT STARTED

**Milestone 3: Full Integration Release** (Due: Day 23)
- Progress: 0% (blocked by Milestone 2)
- Status: NOT STARTED
```

---

## 🤖 Automation Rules

### GitHub Actions Integration

Create `.github/workflows/issue-automation.yml`:

```yaml
name: Issue Automation

on:
  issues:
    types: [opened, edited, closed]
  issue_comment:
    types: [created]

jobs:
  update-metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Update Progress Metrics
        run: |
          # Calculate completion percentage from task lists
          # Update master issue with latest metrics
          # Post to swarm/github/metrics

  notify-blockers:
    runs-on: ubuntu-latest
    steps:
      - name: Notify on Blocker
        if: contains(github.event.issue.labels.*.name, 'priority-critical')
        run: |
          # Post to swarm/global/blockers
          # Notify Project Coordinator via hooks
```

### Automatic Status Updates

When agents complete work via hooks:
```bash
# Agent completes stream
npx claude-flow@alpha hooks post-task --task-id "phase-1-stream-1a"

# Triggers GitHub action to update issue
# - Marks task as complete [x]
# - Updates progress percentage
# - Posts completion comment
```

---

## 📋 Issue Templates

### Template: Phase Issue

Create `.github/ISSUE_TEMPLATE/phase-issue.md`:

```markdown
---
name: Phase Issue
about: Track work for a specific phase
title: '[PHASE-X] <Phase Name> - Days X-Y'
labels: 'phase-X, integration'
assignees: 'project-coordinator'
---

**Parent Issue**: #XXX [INTEGRATION] RuVector Ecosystem Integration

## 🎯 Phase Objective

<Brief description of phase goal>

## 📋 Work Streams

### Stream XA: <Stream Name> (Xh)
**Agents**: <agent-types>
- [ ] Task 1
- [ ] Task 2

**Progress**: 0% | **Assigned**: @agent1, @agent2

## 📊 Phase Metrics

- **Tests**: 0 / X+
- **Coverage**: TBD / 80%+

## 🚨 Blockers

_None_

## 📅 Timeline

- **Start**: Day X
- **End**: Day Y
- **Checkpoint**: End of Day Y

## 🔄 Daily Updates

_Updates posted daily by Project Coordinator_
```

### Template: Blocker Issue

Create `.github/ISSUE_TEMPLATE/blocker-issue.md`:

```markdown
---
name: Blocker
about: Report a blocking issue
title: '[BLOCKER] <Brief Description>'
labels: 'priority-critical'
assignees: 'project-coordinator'
---

**Discovered**: <date> <time> by @<agent>
**Severity**: HIGH | MEDIUM | LOW
**Impact**: <impact on timeline>

## Issue Description

<Detailed description>

## Affected Work Streams

- Stream XA: <impact>

## Proposed Solution

<Solution approach>

## Timeline Impact

- **Original**: <original timeline>
- **Revised**: <new timeline>

## Action Items

- [ ] @agent: <action> (<time estimate>)

## Status Updates

**<timestamp>** - <update>
```

---

## 🎯 Quality Standards

### Issue Quality Checklist

Before posting any update, verify:

- [ ] **Clarity**: Issue title and description are clear and specific
- [ ] **Completeness**: All required sections filled out
- [ ] **Accuracy**: Progress percentages match task completion
- [ ] **Timeliness**: Updates posted within required timeframe
- [ ] **Links**: All cross-references are correct
- [ ] **Labels**: Appropriate labels applied
- [ ] **Formatting**: Markdown renders correctly

### Update Quality Standards

**Daily Updates**:
- Minimum 3 sections: Completed, In Progress, Tomorrow's Focus
- Include specific agent mentions
- Include metrics (tests, coverage, performance)
- Note any blockers (even if "None")

**Checkpoint Updates**:
- Full deliverables review (all streams)
- Complete metrics table
- Quality gates validation
- Lessons learned section
- Next phase preview

**Blocker Updates**:
- Severity assessment
- Timeline impact analysis
- Proposed solution
- Action items with time estimates
- Regular status updates until resolved

---

## 📞 Communication Channels

### When to Use GitHub vs. Memory

**Use GitHub Issues for**:
- Progress updates (visible to all stakeholders)
- Blocker reporting (requires attention)
- Checkpoint summaries (permanent record)
- Timeline changes (transparency)
- Milestone tracking (project planning)

**Use Memory (swarm/*) for**:
- Real-time agent coordination
- Code handoffs between agents
- Technical implementation details
- Temporary working state
- High-frequency updates

**Use Both for**:
- Critical blockers (memory for immediate coordination, GitHub for visibility)
- Phase completions (memory for agent sync, GitHub for record)

---

## 📊 Metrics Dashboard

### Master Issue Metrics Section

Update daily in master issue:

```markdown
## 📊 Project Metrics

### Overall Progress
**Completion**: 35% (Phases 0-1 complete, Phase 2 in progress)

### Testing
- **Tests Written**: 152 / 500+ (30%)
- **Test Coverage**: 78% / 80% (target)
- **Tests Passing**: 152 / 152 (100% ✅)

### Performance
- **vs Baseline**: -2% (within ±5% target ✅)
- **Memory Usage**: -18% (optimization working ✅)
- **WASM Load Time**: -25% (significant improvement ✅)

### Documentation
- **API Pages Updated**: 8 / 20
- **Examples Created**: 12 / 30
- **Guides Written**: 3 / 8

### Timeline
- **Current Phase**: Phase 2 (Day 5 of 23)
- **Schedule Status**: ON TRACK
- **Days Ahead/Behind**: 0 days

### Quality
- **Code Review Status**: All PRs reviewed within 24h ✅
- **Security Issues**: 0 critical, 0 high
- **Rework Rate**: 3% (target: <5% ✅)

### Agent Health
- **Agent Utilization**: 85% (optimal range)
- **Collaboration Overhead**: 15% (within target)
- **Blocked Agents**: 0

---
_Last Updated: 2026-01-04 19:00 by Project Coordinator_
```

---

## 🔄 Weekly Summary

Post every Friday (or last day of work week):

```markdown
## 📅 Week 1 Summary (Days 0-5)

### 🎉 Achievements
- ✅ Phase 0: Foundation complete
- ✅ Phase 1: Core AgentDB Updates complete
- 🔄 Phase 2: PostgreSQL Backend 60% complete

### 📊 Week Metrics
- **Tests Written**: 102 (target: 100+) ✅
- **Coverage Gain**: +23% (55% → 78%)
- **Performance**: -2% vs baseline ✅
- **Documentation**: 8 pages updated

### 👥 Agent Performance
- **Most Productive**: @backend-dev (42h, 8 streams)
- **Best Collaboration**: @backend-dev ↔ @ml-developer (zero rework)
- **Rising Star**: @tdd-tester (exceeded test targets by 20%)

### 🚨 Blockers Resolved
- Blocker #1: PostgreSQL migration memory issue (resolved Day 6)

### 🎯 Next Week Focus
- Complete Phase 2 (Days 6-7)
- Execute Phase 3 (Days 8-11)
- Prepare for Phase 4 checkpoint

### 📈 Timeline Status
**ON TRACK** - 0 days variance from plan

---
_Posted by Project Coordinator at 2026-01-03 18:00_
```

---

**Document Version**: 1.0
**Last Updated**: 2025-12-30
**Companion Documents**: SWARM_EXECUTION_PLAN.md, AGENT_COORDINATION_MATRIX.md
**Owner**: Project Coordinator Agent

