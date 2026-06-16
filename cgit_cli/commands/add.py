"""File management commands."""

from pathlib import Path
from core.filesystem import CGitFileSystem


class AddCommands:
    """Handle file addition and management commands."""
    
    def __init__(self):
        """Initialize add commands."""
        self.fs = CGitFileSystem()
    
    def add(self, file_path: str) -> bool:
        """
        Add a file to the cgit repository.
        
        Args:
            file_path: Path to the file to add
            
        Returns:
            True if successful, False otherwise
        """
        if not self.fs.is_initialized():
            print("✗ Not a cgit repository. Use 'cgit init' first.")
            return False
        
        try:
            file_hash = self.fs.add_file(file_path)
            print(f"✓ Added file: {file_path}")
            print(f"  Hash: {file_hash}")
            return True
            
        except FileNotFoundError as e:
            print(f"✗ {e}")
            return False
        except UnicodeDecodeError:
            print(f"✗ File is not a valid text file: {file_path}")
            return False
        except Exception as e:
            print(f"✗ Failed to add file: {e}")
            return False
    
    def hash_file(self, file_path: str) -> bool:
        """
        Display the hash of a file without adding it.
        
        Args:
            file_path: Path to the file to hash
            
        Returns:
            True if successful, False otherwise
        """
        try:
            content, file_hash = self.fs.read_and_hash_file(file_path)
            print(f"File: {file_path}")
            print(f"Hash: {file_hash}")
            print(f"Size: {len(content)} bytes")
            return True
            
        except FileNotFoundError as e:
            print(f"✗ {e}")
            return False
        except UnicodeDecodeError:
            print(f"✗ File is not a valid text file: {file_path}")
            return False
        except Exception as e:
            print(f"✗ Failed to hash file: {e}")
            return False
    
    def cat_object(self, object_hash: str) -> bool:
        """
        Display the contents of an object by its hash.
        
        Args:
            object_hash: Hash of the object to display
            
        Returns:
            True if successful, False otherwise
        """
        if not self.fs.is_initialized():
            print("✗ Not a cgit repository. Use 'cgit init' first.")
            return False
        
        try:
            content = self.fs.read_object(object_hash)
            print(content)
            return True
            
        except FileNotFoundError as e:
            print(f"✗ {e}")
            return False
        except Exception as e:
            print(f"✗ Failed to read object: {e}")
            return False

# Made with Bob
