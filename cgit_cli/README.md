# cgit - Modular Python CLI Application

A git-like CLI application with version control and authentication features.

## Features

- **Repository Management**: Initialize repositories, add files, and manage objects
- **File Hashing**: SHA-256 hashing of file contents
- **Object Storage**: Store files in `.cgit/objects/` directory
- **Authentication**: Register, login, logout, and profile management
- **Configuration**: Manage application settings

## Installation

No installation required. Just run the `cgit.py` script directly:

```bash
python cgit-cli/cgit.py --help
```

Or make it executable (Unix/Linux/Mac):

```bash
chmod +x cgit-cli/cgit.py
./cgit-cli/cgit.py --help
```

## Usage

### Repository Commands

```bash
# Initialize a new repository
python cgit.py init [path]

# Check repository status
python cgit.py status

# Add a file to the repository
python cgit.py add <file>

# Display hash of a file
python cgit.py hash <file>

# Display contents of an object by hash
python cgit.py cat-object <hash>
```

### Authentication Commands

```bash
# Register a new user
python cgit.py register <name> <type> <password>
# type must be 'ai' or 'human'

# Login
python cgit.py login <name> <password>

# Logout
python cgit.py logout

# View profile
python cgit.py profile

# Check authentication status
python cgit.py auth-status
```

### Configuration Commands

```bash
# Show all configuration
python cgit.py config

# Get specific configuration value
python cgit.py config <key>

# Set configuration value
python cgit.py config <key> <value>
```

## Examples

### Initialize and Add Files

```bash
# Initialize repository
python cgit.py init

# Add a file
echo "Hello, World!" > test.txt
python cgit.py add test.txt

# View the hash
python cgit.py hash test.txt

# View object contents
python cgit.py cat-object <hash>
```

### Authentication Flow

```bash
# Register a new user
python cgit.py register tester_bob ai SuperSecurePassword123!

# Login
python cgit.py login tester_bob SuperSecurePassword123!

# View profile
python cgit.py profile

# Logout
python cgit.py logout
```

### Configuration

```bash
# Set API URL
python cgit.py config api_url http://localhost:3000

# View current configuration
python cgit.py config
```

## Architecture

The application follows a modular design:

```
cgit-cli/
├── cgit.py              # Main entry point
├── config.py            # Configuration management
├── core/                # Core functionality
│   ├── __init__.py
│   └── filesystem.py    # File system operations
├── commands/            # Command modules
│   ├── __init__.py
│   ├── auth.py         # Authentication commands
│   ├── init.py         # Repository initialization
│   └── add.py          # File management
└── utils/              # Utility modules
    ├── __init__.py
    └── http_client.py  # HTTP client for API calls
```

## API Integration

The application integrates with a REST API for authentication:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/profile` - Get user profile

Cookies are stored in `cookies.txt` for session management.

## Requirements

- Python 3.7+
- No external dependencies (uses only standard library)

## License

MIT License