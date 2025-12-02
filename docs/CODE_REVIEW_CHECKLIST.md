# Code Review Checklist

Use this checklist when reviewing pull requests for Agentic-Flow.

## General

- [ ] Code follows the project's coding standards
- [ ] Code is self-documenting and readable
- [ ] No unnecessary comments (code speaks for itself)
- [ ] Complex logic is explained with comments
- [ ] No commented-out code
- [ ] No debug statements (console.log, debugger, etc.)

## TypeScript & Types

- [ ] All functions have explicit return types
- [ ] No use of `any` type (use `unknown` if necessary)
- [ ] Type imports are separated from value imports
- [ ] Interfaces are used over type aliases where appropriate
- [ ] Proper use of generics
- [ ] No type assertions unless absolutely necessary
- [ ] Strict null checks are satisfied

## Code Quality

- [ ] Functions are small and focused (< 150 lines)
- [ ] Cyclomatic complexity is low (< 15)
- [ ] Maximum 5 parameters per function
- [ ] No deep nesting (< 4 levels)
- [ ] DRY principle followed (no duplication)
- [ ] SOLID principles applied
- [ ] Appropriate design patterns used

## Error Handling

- [ ] Errors are properly caught and handled
- [ ] Custom error classes are used
- [ ] Error messages are descriptive
- [ ] No silent failures
- [ ] Async errors are properly handled
- [ ] No throwing non-Error objects

## Async/Await

- [ ] All promises are awaited
- [ ] No floating promises
- [ ] Proper use of try-catch in async functions
- [ ] `return await` used in try-catch blocks
- [ ] No unnecessary async/await

## Security

- [ ] No hardcoded secrets or credentials
- [ ] Input validation is performed
- [ ] No use of `eval` or `Function` constructor
- [ ] SQL injection prevention measures
- [ ] XSS prevention measures
- [ ] Proper authentication and authorization checks

## Performance

- [ ] No unnecessary computations in loops
- [ ] Efficient algorithms used
- [ ] Proper use of caching where appropriate
- [ ] Database queries are optimized
- [ ] No N+1 query problems
- [ ] Memory leaks prevented

## Testing

- [ ] Unit tests cover new code
- [ ] Edge cases are tested
- [ ] Error conditions are tested
- [ ] Tests are meaningful and not trivial
- [ ] Test names are descriptive
- [ ] Code coverage meets threshold (80%+)
- [ ] Integration tests for component interactions

## Documentation

- [ ] README updated if needed
- [ ] API documentation updated
- [ ] JSDoc comments for public APIs
- [ ] CHANGELOG updated
- [ ] Migration guide if breaking changes

## Git

- [ ] Commit messages follow Conventional Commits
- [ ] Logical commit history (not too many commits)
- [ ] No merge commits in feature branch
- [ ] Branch is up to date with target branch
- [ ] No conflicts

## Dependencies

- [ ] New dependencies are justified
- [ ] No duplicate dependencies
- [ ] Dependencies are at stable versions
- [ ] No known security vulnerabilities
- [ ] License compatibility checked

## CI/CD

- [ ] All CI checks pass
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No new warnings

## Final Checks

- [ ] Code works as intended
- [ ] No breaking changes (or documented if intentional)
- [ ] Backward compatibility maintained
- [ ] Performance is acceptable
- [ ] Code is production-ready

## Additional Notes

Use this section for any additional feedback or concerns that don't fit the checklist.
