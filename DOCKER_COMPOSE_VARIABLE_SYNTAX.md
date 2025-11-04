# Docker Compose Variable Substitution Syntax

## `${VARIABLE:-default}` Syntax

This is a **shell-style variable substitution** that Docker Compose supports.

### Meaning
- **If `VARIABLE` is set** → Use that value
- **If `VARIABLE` is not set or empty** → Use `default` value

### Example
```yaml
environment:
  AWS_PROFILE: ${AWS_PROFILE:-is458jon}
```

**Behavior:**
1. If you set `AWS_PROFILE=myprofile` in your environment → uses `myprofile`
2. If `AWS_PROFILE` is not set → uses `is458jon` as default

## Why Use This?

### Benefits
1. **Flexibility**: Others can override without changing the file
2. **Default Values**: Works out-of-the-box for you
3. **Team-Friendly**: Each developer can use their own AWS profile
4. **Safe for GitHub**: No hardcoded personal values

### Real-World Example

**Your setup:**
```bash
# You don't need to set anything - uses default
docker-compose up  # Uses AWS_PROFILE=is458jon
```

**Teammate's setup:**
```bash
# They can override with their own profile
export AWS_PROFILE=theirprofile
docker-compose up  # Uses AWS_PROFILE=theirprofile
```

## Other Variable Syntax Options

### 1. `${VARIABLE}` (Required)
```yaml
AWS_REGION: ${AWS_REGION}
```
- **Error if not set**: Docker Compose will fail if `AWS_REGION` is not defined
- Use when: Variable is required

### 2. `${VARIABLE:-default}` (Optional with default)
```yaml
AWS_PROFILE: ${AWS_PROFILE:-is458jon}
```
- **Uses default if not set**: No error, uses fallback value
- Use when: Variable is optional but has a sensible default

### 3. `${VARIABLE:?error_message}` (Required with error)
```yaml
DATABASE_URL: ${DATABASE_URL:?Database URL is required}
```
- **Error with message if not set**: Shows helpful error message
- Use when: Variable is required and you want a clear error

## In Your docker-compose.test.yml

```yaml
environment:
  AWS_PROFILE: ${AWS_PROFILE:-is458jon}           # Optional, defaults to is458jon
  S3_BUCKET_NAME: ${S3_BUCKET_NAME:-is458-products-img}  # Optional, has default
  CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}           # Required, no default (from .env.docker-test)
```

**What this means:**
- `AWS_PROFILE` and `S3_BUCKET_NAME` will work without any setup (uses defaults)
- `CLERK_SECRET_KEY` must be provided (either in `.env.docker-test` or environment)

## Testing Variable Substitution

You can test how Docker Compose resolves variables:

```bash
# See what values Docker Compose will use
docker-compose config | grep AWS_PROFILE

# Or for a specific service
docker-compose config | grep -A 5 "product-service"
```

## Summary

| Syntax | Behavior | Use Case |
|--------|----------|----------|
| `${VAR}` | Uses VAR, fails if not set | Required variables |
| `${VAR:-default}` | Uses VAR if set, else default | Optional with sensible default |
| `${VAR:?error}` | Uses VAR, fails with error if not set | Required with helpful error |

**Your code**: Uses `${VAR:-default}` which is perfect for test configuration files that should work out-of-the-box but allow customization.

