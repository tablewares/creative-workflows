"""
Core file-system logic for .cgit/ directory management.
Handles file hashing, object storage, and repository initialization.
"""

import os
import hashlib
import shutil
from pathlib import Path
from typing import Optional


class CGitFileSystem:
    """Manages the .cgit directory structure and file operations."""
    
    CGIT_DIR = ".cgit"
    OBJECTS_DIR = "objects"
    REFS_DIR = "refs"
    HEAD_FILE = "HEAD"
    CONFIG_FILE = "config"
    
    def __init__(self, repo_path: str = "."):
        """
        Initialize CGitFileSystem.
        
        Args:
            repo_path: Path to the repository root (default: current directory)
        """
        self.repo_path = Path(repo_path).resolve()
        self.cgit_path = self.repo_path / self.CGIT_DIR
        self.objects_path = self.cgit_path / self.OBJECTS_DIR
        self.refs_path = self.cgit_path / self.REFS_DIR
    
    def init_repository(self) -> bool:
        """
        Initialize a new .cgit repository structure.
        
        Returns:
            True if successful, False if repository already exists
        """
        if self.cgit_path.exists():
            return False
        
        # Create directory structure
        self.cgit_path.mkdir(parents=True, exist_ok=True)
        self.objects_path.mkdir(parents=True, exist_ok=True)
        self.refs_path.mkdir(parents=True, exist_ok=True)
        (self.refs_path / "heads").mkdir(exist_ok=True)
        (self.refs_path / "tags").mkdir(exist_ok=True)
        
        # Create HEAD file
        head_file = self.cgit_path / self.HEAD_FILE
        head_file.write_text("ref: refs/heads/main\n")
        
        # Create config file
        config_file = self.cgit_path / self.CONFIG_FILE
        config_file.write_text("[core]\n\trepositoryformatversion = 0\n")
        
        return True
    
    def hash_file_content(self, content: str) -> str:
        """
        Generate SHA-256 hash of file content.
        
        Args:
            content: Text content to hash
            
        Returns:
            Hexadecimal hash string
        """
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    def read_and_hash_file(self, file_path: str) -> tuple[str, str]:
        """
        Read a local file and generate its SHA-256 hash.
        
        Args:
            file_path: Path to the file to read
            
        Returns:
            Tuple of (content, hash)
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            PermissionError: If the file cannot be read
            UnicodeDecodeError: If the file is not a text file
        """
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if not path.is_file():
            raise ValueError(f"Path is not a file: {file_path}")
        
        try:
            content = path.read_text(encoding='utf-8')
        except PermissionError:
            raise PermissionError(f"Permission denied reading file: {file_path}")
        except UnicodeDecodeError:
            raise UnicodeDecodeError(
                'utf-8', b'', 0, 1,
                f"File is not a valid text file: {file_path}"
            )
        
        file_hash = self.hash_file_content(content)
        return content, file_hash
    
    def save_object(self, content: str, object_hash: Optional[str] = None) -> str:
        """
        Save content to .cgit/objects/ directory named after its hash.
        
        Args:
            content: Content to save
            object_hash: Pre-computed hash (optional, will compute if not provided)
            
        Returns:
            The hash of the saved object
            
        Raises:
            RuntimeError: If repository is not initialized
        """
        if not self.cgit_path.exists():
            raise RuntimeError(
                "Repository not initialized. Run 'cgit init' first."
            )
        
        # Compute hash if not provided
        if object_hash is None:
            object_hash = self.hash_file_content(content)
        
        # Create subdirectory using first 2 characters of hash (like git)
        subdir = self.objects_path / object_hash[:2]
        subdir.mkdir(exist_ok=True)
        
        # Save object file
        object_file = subdir / object_hash[2:]
        object_file.write_text(content, encoding='utf-8')
        
        return object_hash
    
    def read_object(self, object_hash: str) -> str:
        """
        Read an object from the .cgit/objects/ directory.
        
        Args:
            object_hash: Hash of the object to read
            
        Returns:
            Content of the object
            
        Raises:
            FileNotFoundError: If object doesn't exist
        """
        subdir = self.objects_path / object_hash[:2]
        object_file = subdir / object_hash[2:]
        
        if not object_file.exists():
            raise FileNotFoundError(f"Object not found: {object_hash}")
        
        return object_file.read_text(encoding='utf-8')
    
    def object_exists(self, object_hash: str) -> bool:
        """
        Check if an object exists in the repository.
        
        Args:
            object_hash: Hash of the object to check
            
        Returns:
            True if object exists, False otherwise
        """
        subdir = self.objects_path / object_hash[:2]
        object_file = subdir / object_hash[2:]
        return object_file.exists()
    
    def add_file(self, file_path: str) -> str:
        """
        Read a file, hash it, and save it to the objects directory.
        
        Args:
            file_path: Path to the file to add
            
        Returns:
            Hash of the added file
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            RuntimeError: If repository is not initialized
        """
        content, file_hash = self.read_and_hash_file(file_path)
        
        # Only save if object doesn't already exist
        if not self.object_exists(file_hash):
            self.save_object(content, file_hash)
        
        return file_hash
    
    def is_initialized(self) -> bool:
        """
        Check if the current directory is a cgit repository.
        
        Returns:
            True if .cgit directory exists, False otherwise
        """
        return self.cgit_path.exists() and self.cgit_path.is_dir()

# Made with Bob
