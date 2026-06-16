#!/usr/bin/env python3
"""
cgit - A modular Python CLI application for version control and authentication.

Usage:
    cgit init [<path>]
    cgit status
    cgit add <file>
    cgit hash <file>
    cgit cat-object <hash>
    cgit register <name> <type> <password>
    cgit login <name> <password>
    cgit logout
    cgit profile
    cgit auth-status
    cgit remote <subcommand> [<args>...]
    cgit project <subcommand> [<args>...]
    cgit branch <subcommand> [<args>...]
    cgit checkout <branch>
    cgit config [<key> [<value>]]
    cgit --help
    cgit --version

Commands:
    init            Initialize a new cgit repository
    status          Show repository status
    add             Add a file to the repository
    hash            Display the hash of a file
    cat-object      Display the contents of an object by hash
    register        Register a new user (type: ai or human)
    login           Login with username and password
    logout          Logout current user
    profile         Display current user profile
    auth-status     Show authentication status
    remote          Manage remote URLs (add, set-url, get-url, show, -v, remove)
    project         Manage projects (create, list, show, use, current)
    branch          Manage branches (create, list, current, -d)
    checkout        Switch to a branch
    config          Get or set configuration values
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from commands import AuthCommands, InitCommands, AddCommands, RemoteCommands, ProjectCommands, BranchCommands
from config import Config


VERSION = "1.0.0"


def print_help():
    """Print help message."""
    print(__doc__)


def print_version():
    """Print version information."""
    print(f"cgit version {VERSION}")


def handle_config(config: Config, args: list):
    """Handle config command."""
    if len(args) == 0:
        # Show all config
        print("Configuration:")
        for key, value in config.get_all().items():
            print(f"  {key} = {value}")
        return True
    elif len(args) == 1:
        # Get specific config value
        key = args[0]
        value = config.get(key)
        if value is not None:
            print(f"{key} = {value}")
            return True
        else:
            print(f"✗ Configuration key not found: {key}")
            return False
    elif len(args) == 2:
        # Set config value
        key, value = args
        config.set(key, value)
        config.save()
        print(f"✓ Set {key} = {value}")
        return True
    else:
        print("✗ Invalid config command. Usage: cgit config [<key> [<value>]]")
        return False


def main():
    """Main entry point for cgit CLI."""
    if len(sys.argv) < 2:
        print_help()
        sys.exit(1)
    
    command = sys.argv[1]
    args = sys.argv[2:]
    
    # Handle help and version
    if command in ['--help', '-h', 'help']:
        print_help()
        sys.exit(0)
    
    if command in ['--version', '-v', 'version']:
        print_version()
        sys.exit(0)
    
    # Initialize command handlers
    config = Config()
    auth_cmd = AuthCommands(config)
    init_cmd = InitCommands()
    add_cmd = AddCommands()
    remote_cmd = RemoteCommands(config)
    project_cmd = ProjectCommands(config)
    branch_cmd = BranchCommands(config)
    
    success = False
    
    try:
        # Repository commands
        if command == 'init':
            path = args[0] if args else "."
            success = init_cmd.init(path)
        
        elif command == 'status':
            success = init_cmd.status()
        
        elif command == 'add':
            if not args:
                print("✗ Usage: cgit add <file>")
                sys.exit(1)
            success = add_cmd.add(args[0])
        
        elif command == 'hash':
            if not args:
                print("✗ Usage: cgit hash <file>")
                sys.exit(1)
            success = add_cmd.hash_file(args[0])
        
        elif command == 'cat-object':
            if not args:
                print("✗ Usage: cgit cat-object <hash>")
                sys.exit(1)
            success = add_cmd.cat_object(args[0])
        
        # Authentication commands
        elif command == 'register':
            if len(args) != 3:
                print("✗ Usage: cgit register <name> <type> <password>")
                print("  type must be 'ai' or 'human'")
                sys.exit(1)
            name, user_type, password = args
            success = auth_cmd.register(name, user_type, password)
        
        elif command == 'login':
            if len(args) != 2:
                print("✗ Usage: cgit login <name> <password>")
                sys.exit(1)
            name, password = args
            success = auth_cmd.login(name, password)
        
        elif command == 'logout':
            success = auth_cmd.logout()
        
        elif command == 'profile':
            success = auth_cmd.profile()
        
        elif command == 'auth-status':
            success = auth_cmd.status()
        
        # Remote commands
        elif command == 'remote':
            if not args:
                success = remote_cmd.list()
            else:
                subcommand = args[0]
                sub_args = args[1:]
                
                if subcommand == 'add':
                    if len(sub_args) != 2:
                        print("✗ Usage: cgit remote add <name> <url>")
                        sys.exit(1)
                    success = remote_cmd.add(sub_args[0], sub_args[1])
                
                elif subcommand == 'set-url':
                    if len(sub_args) != 2:
                        print("✗ Usage: cgit remote set-url <name> <url>")
                        sys.exit(1)
                    success = remote_cmd.set_url(sub_args[0], sub_args[1])
                
                elif subcommand == 'get-url':
                    name = sub_args[0] if sub_args else 'origin'
                    success = remote_cmd.get_url(name)
                
                elif subcommand == 'show':
                    name = sub_args[0] if sub_args else 'origin'
                    success = remote_cmd.show(name)
                
                elif subcommand == '-v':
                    success = remote_cmd.list()
                
                elif subcommand == 'remove':
                    if not sub_args:
                        print("✗ Usage: cgit remote remove <name>")
                        sys.exit(1)
                    success = remote_cmd.remove(sub_args[0])
                
                else:
                    print(f"✗ Unknown remote subcommand: {subcommand}")
                    print("Available: add, set-url, get-url, show, -v, remove")
                    sys.exit(1)
        
        # Project commands
        elif command == 'project':
            if not args:
                print("✗ Usage: cgit project <subcommand> [<args>...]")
                print("Available subcommands: create, list, show, use, current")
                sys.exit(1)
            
            subcommand = args[0]
            sub_args = args[1:]
            
            if subcommand == 'create':
                if not sub_args:
                    print("✗ Usage: cgit project create <name> [<description>]")
                    sys.exit(1)
                name = sub_args[0]
                description = ' '.join(sub_args[1:]) if len(sub_args) > 1 else ""
                success = project_cmd.create(name, description)
            
            elif subcommand == 'list':
                success = project_cmd.list()
            
            elif subcommand == 'show':
                if not sub_args:
                    print("✗ Usage: cgit project show <name>")
                    sys.exit(1)
                success = project_cmd.show(sub_args[0])
            
            elif subcommand == 'use':
                if not sub_args:
                    print("✗ Usage: cgit project use <name>")
                    sys.exit(1)
                success = project_cmd.set_current(sub_args[0])
            
            elif subcommand == 'current':
                success = project_cmd.current()
            
            else:
                print(f"✗ Unknown project subcommand: {subcommand}")
                print("Available: create, list, show, use, current")
                sys.exit(1)
        
        # Branch commands
        elif command == 'branch':
            if not args:
                success = branch_cmd.list()
            else:
                subcommand = args[0]
                sub_args = args[1:]
                
                if subcommand == 'list':
                    success = branch_cmd.list()
                
                elif subcommand == 'current':
                    success = branch_cmd.current()
                
                elif subcommand == '-d':
                    if not sub_args:
                        print("✗ Usage: cgit branch -d <name>")
                        sys.exit(1)
                    success = branch_cmd.delete(sub_args[0])
                
                else:
                    # Create branch
                    success = branch_cmd.create(subcommand)
        
        # Checkout command
        elif command == 'checkout':
            if not args:
                print("✗ Usage: cgit checkout <branch>")
                sys.exit(1)
            success = branch_cmd.checkout(args[0])
        
        # Configuration command
        elif command == 'config':
            success = handle_config(config, args)
        
        else:
            print(f"✗ Unknown command: {command}")
            print("Run 'cgit --help' for usage information")
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n✗ Operation cancelled by user")
        sys.exit(130)
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        sys.exit(1)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

# Made with Bob
