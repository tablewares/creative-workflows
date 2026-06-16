"""Repository initialization commands."""

from core.filesystem import CGitFileSystem


class InitCommands:
    """Handle repository initialization commands."""
    
    def __init__(self):
        """Initialize init commands."""
        self.fs = CGitFileSystem()
    
    def init(self, path: str = ".") -> bool:
        """
        Initialize a new cgit repository.
        
        Args:
            path: Path to initialize repository (default: current directory)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            fs = CGitFileSystem(path)
            
            if fs.is_initialized():
                print(f"✗ Repository already initialized at {path}")
                return False
            
            if fs.init_repository():
                print(f"✓ Initialized empty cgit repository in {path}/.cgit/")
                return True
            else:
                print(f"✗ Failed to initialize repository")
                return False
                
        except Exception as e:
            print(f"✗ Initialization failed: {e}")
            return False
    
    def status(self) -> bool:
        """
        Check if current directory is a cgit repository.
        
        Returns:
            True if initialized, False otherwise
        """
        if self.fs.is_initialized():
            print("✓ Current directory is a cgit repository")
            return True
        else:
            print("✗ Not a cgit repository (or any parent up to mount point)")
            print("  Use 'cgit init' to initialize a repository")
            return False

# Made with Bob
