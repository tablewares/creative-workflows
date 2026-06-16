"""Remote management commands for cgit CLI."""

from typing import Optional
from cgit_cli.config import Config
from cgit_cli.core.id_manager import IDManager


class RemoteCommands:
    """Handle remote URL management commands."""
    
    def __init__(self, config: Optional[Config] = None):
        """
        Initialize remote commands.
        
        Args:
            config: Configuration object (optional)
        """
        self.config = config or Config()
        self.id_manager = IDManager()
    
    def add(self, name: str, url: str) -> bool:
        """
        Add a remote URL (git-like: cgit remote add origin <url>).
        
        Args:
            name: Remote name (e.g., 'origin')
            url: Remote URL
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # For now, we only support one remote called 'origin'
            if name != 'origin':
                print(f"✗ Only 'origin' remote is supported currently")
                return False
            
            # Store the remote URL
            self.id_manager.set_remote_url(url)
            
            # Also store in config for backward compatibility
            self.config.set('api_url', url.rstrip('/'))
            self.config.save()
            
            print(f"✓ Remote '{name}' set to: {url}")
            return True
            
        except Exception as e:
            print(f"✗ Failed to add remote: {e}")
            return False
    
    def set_url(self, name: str, url: str) -> bool:
        """
        Change remote URL (git-like: cgit remote set-url origin <url>).
        
        Args:
            name: Remote name (e.g., 'origin')
            url: New remote URL
            
        Returns:
            True if successful, False otherwise
        """
        return self.add(name, url)  # Same implementation
    
    def get_url(self, name: str = 'origin') -> bool:
        """
        Get remote URL (git-like: cgit remote get-url origin).
        
        Args:
            name: Remote name (default: 'origin')
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if name != 'origin':
                print(f"✗ Only 'origin' remote is supported currently")
                return False
            
            url = self.id_manager.get_remote_url()
            
            if url:
                print(url)
                return True
            else:
                print(f"✗ No remote URL set for '{name}'")
                return False
                
        except Exception as e:
            print(f"✗ Failed to get remote URL: {e}")
            return False
    
    def show(self, name: str = 'origin') -> bool:
        """
        Show remote details (git-like: cgit remote show origin).
        
        Args:
            name: Remote name (default: 'origin')
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if name != 'origin':
                print(f"✗ Only 'origin' remote is supported currently")
                return False
            
            url = self.id_manager.get_remote_url()
            
            if url:
                print(f"* remote {name}")
                print(f"  Fetch URL: {url}")
                print(f"  Push  URL: {url}")
                return True
            else:
                print(f"✗ No remote named '{name}'")
                return False
                
        except Exception as e:
            print(f"✗ Failed to show remote: {e}")
            return False
    
    def list(self) -> bool:
        """
        List all remotes (git-like: cgit remote -v).
        
        Returns:
            True if successful, False otherwise
        """
        try:
            url = self.id_manager.get_remote_url()
            
            if url:
                print(f"origin\t{url} (fetch)")
                print(f"origin\t{url} (push)")
                return True
            else:
                print("No remotes configured")
                return False
                
        except Exception as e:
            print(f"✗ Failed to list remotes: {e}")
            return False
    
    def remove(self, name: str) -> bool:
        """
        Remove a remote (git-like: cgit remote remove origin).
        
        Args:
            name: Remote name
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if name != 'origin':
                print(f"✗ Only 'origin' remote is supported currently")
                return False
            
            self.id_manager.set_remote_url(None)
            self.config.set('api_url', 'http://localhost:3000')
            self.config.save()
            
            print(f"✓ Remote '{name}' removed")
            return True
            
        except Exception as e:
            print(f"✗ Failed to remove remote: {e}")
            return False


# Made with Bob