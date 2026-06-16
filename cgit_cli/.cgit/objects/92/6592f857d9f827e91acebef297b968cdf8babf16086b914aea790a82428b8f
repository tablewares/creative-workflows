# CGIT Remote Management Documentation

## Overview

The CGIT CLI remote management system provides git-like commands for managing remote server URLs and storing all IDs (user, project, branch, commit) in a centralized location. This document explains how the remote system works, its architecture, and usage examples.

## Architecture

### Components

1. **IDManager** (`cgit_cli/core/id_manager.py`)
   - Central storage for all IDs and remote URL
   - Persists data to `.cgit/ids.json`
   - Provides methods for storing and retrieving IDs

2. **RemoteCommands** (`cgit_cli/commands/remote.py`)
   - Handles remote URL management
   - Integrates with IDManager for storage
   - Provides git-like interface

3. **Config** (`cgit_cli/config.py`)
   - Stores configuration including API URL
   - Syncs with IDManager for backward compatibility

### Data Storage

All IDs and remote information are stored in `.cgit/ids.json`:

```json
{
  "user_id": "4296f3ac-8fc8-4316-b0ad-9642c92499a2",
  "remote_url": "http://localhost:3000",
  "projects": {
    "AI Startup Ideas": "359c6ae5-96c4-4ba2-8a2b-6ba9e6e3d2c7"
  },
  "branches": {
    "AI Startup Ideas": {
      "main": "3032e133-4ade-47af-9dc2-10ff30339f72",
      "feature-x": "abc123-def456-789012"
    }
  },
  "commits": {
    "AI Startup Ideas": {
      "main": [
        "dfe68d8c-51b6-44a5-86ec-23b06d273de7",
        "abc123-def456-789012"
      ]
    }
  }
}
```

## How Remote Works

### 1. Setting a Remote URL

When you set a remote URL, the system:

1. Stores the URL in the IDManager (`.cgit/ids.json`)
2. Updates the Config file (`.cgit/config.json`) for backward compatibility
3. All subsequent API calls use this URL

```bash
cgit remote add origin http://localhost:3000
```

**What happens internally:**
```python
# 1. IDManager stores the URL
id_manager.set_remote_url('http://localhost:3000')

# 2. Config is updated
config.set('api_url', 'http://localhost:3000')
config.save()

# 3. URL is persisted to .cgit/ids.json
```

### 2. Using the Remote URL

All command classes (AuthCommands, ProjectCommands, BranchCommands) automatically:

1. Check IDManager for remote URL first
2. Fall back to Config if not found
3. Default to `http://localhost:3000` if neither exists

```python
# In ProjectCommands.__init__()
self.base_url = self.id_manager.get_remote_url() or \
                self.config.get('api_url', 'http://localhost:3000')
```

### 3. ID Storage Flow

When you interact with the API, IDs are automatically extracted and stored:

#### User Registration/Login
```bash
cgit register tester_bob human SuperSecurePassword123!
# API Response: {"user": {"id": "4296f3ac-...", "name": "tester_bob"}}
# Stored: user_id in IDManager
```

#### Project Creation
```bash
cgit project create "AI Startup Ideas" "Hackathon Demo"
# API Response: {"id": "359c6ae5-...", "name": "AI Startup Ideas"}
# Stored: projects["AI Startup Ideas"] = "359c6ae5-..."
```

#### Branch Creation
```bash
cgit branch main
# API Response: {"id": "3032e133-...", "name": "main"}
# Stored: branches["AI Startup Ideas"]["main"] = "3032e133-..."
```

## Command Reference

### Remote Commands

#### Add/Set Remote URL
```bash
# Add a new remote (only 'origin' supported currently)
cgit remote add origin http://localhost:3000

# Change existing remote URL
cgit remote set-url origin http://api.example.com:3000
```

#### Get Remote URL
```bash
# Display the remote URL
cgit remote get-url origin
# Output: http://localhost:3000
```

#### Show Remote Details
```bash
# Show detailed remote information
cgit remote show origin
# Output:
# * remote origin
#   Fetch URL: http://localhost:3000
#   Push  URL: http://localhost:3000
```

#### List Remotes
```bash
# List all remotes (verbose)
cgit remote -v
# Output:
# origin  http://localhost:3000 (fetch)
# origin  http://localhost:3000 (push)

# Or simply:
cgit remote
```

#### Remove Remote
```bash
# Remove a remote
cgit remote remove origin
```

## Workflow Examples

### Example 1: Complete Setup Workflow

```bash
# 1. Initialize repository
cgit init

# 2. Set remote URL
cgit remote add origin http://localhost:3000

# 3. Register user
cgit register alice human SecurePass123!
# User ID automatically stored

# 4. Login
cgit login alice SecurePass123!
# User ID retrieved and verified

# 5. Create project
cgit project create "My Project" "Description"
# Project ID automatically stored

# 6. Set current project
cgit project use "My Project"

# 7. Create branch
cgit branch main
# Branch ID automatically stored

# 8. Check stored IDs
cgit config
# Shows all configuration including stored IDs
```

### Example 2: Working with Multiple Projects

```bash
# Create first project
cgit project create "Frontend" "React app"
# ID stored: projects["Frontend"] = "abc-123"

# Create second project
cgit project create "Backend" "Node.js API"
# ID stored: projects["Backend"] = "def-456"

# Switch between projects
cgit project use "Frontend"
cgit branch feature-login

cgit project use "Backend"
cgit branch feature-auth

# List all projects with IDs
cgit project list
```

### Example 3: Branch Management

```bash
# Set current project
cgit project use "My Project"

# Create branches
cgit branch main
cgit branch develop
cgit branch feature-x

# List branches (shows IDs)
cgit branch list

# Switch branches
cgit checkout develop

# Check current branch
cgit branch current
```

## API Integration

### Authentication Flow

```
User → cgit login → POST /api/auth/login → Server
                                              ↓
                                         Response with user ID
                                              ↓
                                         IDManager stores ID
                                              ↓
                                         Cookies saved
```

### Project Creation Flow

```
User → cgit project create → POST /api/projects → Server
                                                     ↓
                                                Response with project ID
                                                     ↓
                                                IDManager stores ID
                                                     ↓
                                                Available for future use
```

### Branch Creation Flow

```
User → cgit branch main → POST /api/branches → Server
                                                  ↓
                                             Response with branch ID
                                                  ↓
                                             IDManager stores ID
                                                  ↓
                                             Linked to project
```

## ID Retrieval and Usage

### Automatic ID Usage

Commands automatically retrieve stored IDs when needed:

```python
# In ProjectCommands.show()
project_id = self.id_manager.get_project_id(name)
response = self._make_request("GET", f"/api/projects/{project_id}")
```

### Manual ID Inspection

You can inspect stored IDs programmatically:

```python
from core.id_manager import IDManager

id_manager = IDManager()

# Get user ID
user_id = id_manager.get_user_id()

# Get project ID
project_id = id_manager.get_project_id("My Project")

# Get branch ID
branch_id = id_manager.get_branch_id("My Project", "main")

# Get all commits for a branch
commits = id_manager.get_commit_ids("My Project", "main")

# Display all stored IDs
id_manager.display_all()
```

## Error Handling

### Remote Not Set
```bash
cgit project create "Test"
# If no remote set, uses default: http://localhost:3000
```

### ID Not Found
```bash
cgit project show "NonExistent"
# Error: Project 'NonExistent' not found locally
# Suggestion: Use 'cgit project list' to see available projects
```

### Connection Errors
```bash
cgit remote add origin http://invalid-url:9999
cgit login user pass
# Error: Connection error: Could not connect to http://invalid-url:9999
```

## Best Practices

1. **Always set remote first**
   ```bash
   cgit remote add origin http://your-server:3000
   ```

2. **Login before creating resources**
   ```bash
   cgit login username password
   cgit project create "My Project"
   ```

3. **Set current project before branch operations**
   ```bash
   cgit project use "My Project"
   cgit branch main
   ```

4. **Verify stored IDs periodically**
   ```bash
   # Check what's stored
   cat .cgit/ids.json
   ```

5. **Backup ID file**
   ```bash
   cp .cgit/ids.json .cgit/ids.json.backup
   ```

## Troubleshooting

### IDs Not Being Stored

**Problem:** Commands execute but IDs aren't saved.

**Solution:**
1. Check `.cgit/` directory exists
2. Verify write permissions
3. Check for errors in command output

### Remote URL Not Working

**Problem:** Commands fail with connection errors.

**Solution:**
1. Verify server is running: `curl http://localhost:3000`
2. Check remote URL: `cgit remote get-url`
3. Update if needed: `cgit remote set-url origin http://correct-url:3000`

### Lost IDs After Logout

**Problem:** User ID cleared but project/branch IDs remain.

**Solution:** This is expected behavior. Only user ID is cleared on logout. Project and branch IDs persist for future sessions.

### Stale IDs

**Problem:** Stored IDs reference deleted resources.

**Solution:**
1. Manually edit `.cgit/ids.json` to remove stale entries
2. Or clear all: `rm .cgit/ids.json` and start fresh

## Advanced Usage

### Programmatic Access

```python
from commands.remote import RemoteCommands
from commands.project import ProjectCommands
from core.id_manager import IDManager
from config import Config

# Setup
config = Config()
id_manager = IDManager()
remote_cmd = RemoteCommands(config)
project_cmd = ProjectCommands(config)

# Set remote
remote_cmd.add('origin', 'http://localhost:3000')

# Create project (ID stored automatically)
project_cmd.create('My Project', 'Description')

# Retrieve stored ID
project_id = id_manager.get_project_id('My Project')
print(f"Project ID: {project_id}")
```

### Custom ID Storage

```python
from core.id_manager import IDManager

id_manager = IDManager()

# Store custom IDs
id_manager.set_project_id('Custom Project', 'custom-id-123')
id_manager.set_branch_id('Custom Project', 'custom-branch', 'branch-id-456')
id_manager.add_commit_id('Custom Project', 'custom-branch', 'commit-id-789')

# Save changes
id_manager.save()
```

## Security Considerations

1. **ID File Security**
   - `.cgit/ids.json` contains sensitive IDs
   - Keep it in `.gitignore`
   - Don't share publicly

2. **Remote URL**
   - Use HTTPS in production
   - Validate server certificates
   - Don't hardcode credentials in URLs

3. **Cookie Storage**
   - Cookies stored in `cookies.txt`
   - Contains session tokens
   - Keep secure and private

## Future Enhancements

Planned features:
- Multiple remote support (origin, upstream, etc.)
- Remote sync/pull to update local IDs
- ID conflict resolution
- Remote backup/restore
- Encrypted ID storage

## Summary

The CGIT remote system provides:
- ✅ Git-like remote management
- ✅ Centralized ID storage
- ✅ Automatic ID extraction from API responses
- ✅ Seamless integration with all commands
- ✅ Persistent storage across sessions
- ✅ Easy programmatic access

For more information, see:
- `cgit_cli/core/id_manager.py` - ID management implementation
- `cgit_cli/commands/remote.py` - Remote command implementation
- `cgit_cli/test_remote_auth.py` - Test examples

---

**Made with Bob**