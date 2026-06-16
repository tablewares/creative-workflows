"""Central ID manager for storing and retrieving IDs."""

import json
from pathlib import Path
from typing import Optional, Dict, Any


class IDManager:
    """Manage all IDs (user, project, branch, commit) in a central location."""
    
    def __init__(self, id_file: str = '.cgit/ids.json'):
        """
        Initialize ID manager.
        
        Args:
            id_file: Path to ID storage file
        """
        self.id_file = Path(id_file)
        self.ids: Dict[str, Any] = {
            'user_id': None,
            'projects': {},  # project_name -> project_id
            'branches': {},  # project_name -> {branch_name -> branch_id}
            'commits': {},   # project_name -> {branch_name -> [commit_ids]}
            'remote_url': None
        }
        self.load()
    
    def load(self):
        """Load IDs from file."""
        if self.id_file.exists():
            try:
                with open(self.id_file, 'r') as f:
                    loaded_ids = json.load(f)
                    self.ids.update(loaded_ids)
            except Exception as e:
                print(f"Warning: Could not load IDs: {e}")
    
    def save(self):
        """Save IDs to file."""
        try:
            # Create parent directory if it doesn't exist
            self.id_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(self.id_file, 'w') as f:
                json.dump(self.ids, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save IDs: {e}")
    
    def set_user_id(self, user_id: Optional[str]):
        """
        Set current user ID.
        
        Args:
            user_id: User ID to store (or None to clear)
        """
        self.ids['user_id'] = user_id
        self.save()
    
    def get_user_id(self) -> Optional[str]:
        """
        Get current user ID.
        
        Returns:
            User ID or None
        """
        return self.ids.get('user_id')
    
    def set_remote_url(self, url: Optional[str]):
        """
        Set remote URL.
        
        Args:
            url: Remote URL to store (or None to clear)
        """
        self.ids['remote_url'] = url
        self.save()
    
    def get_remote_url(self) -> Optional[str]:
        """
        Get remote URL.
        
        Returns:
            Remote URL or None
        """
        return self.ids.get('remote_url')
    
    def set_project_id(self, project_name: str, project_id: str):
        """
        Set project ID.
        
        Args:
            project_name: Name of the project
            project_id: Project ID to store
        """
        self.ids['projects'][project_name] = project_id
        self.save()
    
    def get_project_id(self, project_name: str) -> Optional[str]:
        """
        Get project ID by name.
        
        Args:
            project_name: Name of the project
            
        Returns:
            Project ID or None
        """
        return self.ids['projects'].get(project_name)
    
    def list_projects(self) -> Dict[str, str]:
        """
        List all projects.
        
        Returns:
            Dictionary of project_name -> project_id
        """
        return self.ids['projects'].copy()
    
    def set_branch_id(self, project_name: str, branch_name: str, branch_id: str):
        """
        Set branch ID.
        
        Args:
            project_name: Name of the project
            branch_name: Name of the branch
            branch_id: Branch ID to store
        """
        if project_name not in self.ids['branches']:
            self.ids['branches'][project_name] = {}
        
        self.ids['branches'][project_name][branch_name] = branch_id
        self.save()
    
    def get_branch_id(self, project_name: str, branch_name: str) -> Optional[str]:
        """
        Get branch ID.
        
        Args:
            project_name: Name of the project
            branch_name: Name of the branch
            
        Returns:
            Branch ID or None
        """
        return self.ids['branches'].get(project_name, {}).get(branch_name)
    
    def list_branches(self, project_name: str) -> Dict[str, str]:
        """
        List all branches for a project.
        
        Args:
            project_name: Name of the project
            
        Returns:
            Dictionary of branch_name -> branch_id
        """
        return self.ids['branches'].get(project_name, {}).copy()
    
    def add_commit_id(self, project_name: str, branch_name: str, commit_id: str):
        """
        Add commit ID to branch history.
        
        Args:
            project_name: Name of the project
            branch_name: Name of the branch
            commit_id: Commit ID to store
        """
        if project_name not in self.ids['commits']:
            self.ids['commits'][project_name] = {}
        
        if branch_name not in self.ids['commits'][project_name]:
            self.ids['commits'][project_name][branch_name] = []
        
        self.ids['commits'][project_name][branch_name].append(commit_id)
        self.save()
    
    def get_commit_ids(self, project_name: str, branch_name: str) -> list:
        """
        Get all commit IDs for a branch.
        
        Args:
            project_name: Name of the project
            branch_name: Name of the branch
            
        Returns:
            List of commit IDs
        """
        return self.ids['commits'].get(project_name, {}).get(branch_name, []).copy()
    
    def get_latest_commit_id(self, project_name: str, branch_name: str) -> Optional[str]:
        """
        Get the latest commit ID for a branch.
        
        Args:
            project_name: Name of the project
            branch_name: Name of the branch
            
        Returns:
            Latest commit ID or None
        """
        commits = self.get_commit_ids(project_name, branch_name)
        return commits[-1] if commits else None
    
    def clear(self):
        """Clear all stored IDs."""
        self.ids = {
            'user_id': None,
            'projects': {},
            'branches': {},
            'commits': {},
            'remote_url': None
        }
        self.save()
    
    def display_all(self):
        """Display all stored IDs."""
        print("Stored IDs:")
        print(f"  User ID: {self.ids.get('user_id', 'Not set')}")
        print(f"  Remote URL: {self.ids.get('remote_url', 'Not set')}")
        
        print("\n  Projects:")
        if self.ids['projects']:
            for name, pid in self.ids['projects'].items():
                print(f"    {name}: {pid}")
        else:
            print("    None")
        
        print("\n  Branches:")
        if self.ids['branches']:
            for project, branches in self.ids['branches'].items():
                print(f"    {project}:")
                for branch, bid in branches.items():
                    print(f"      {branch}: {bid}")
        else:
            print("    None")
        
        print("\n  Commits:")
        if self.ids['commits']:
            for project, branches in self.ids['commits'].items():
                print(f"    {project}:")
                for branch, commits in branches.items():
                    print(f"      {branch}: {len(commits)} commit(s)")
        else:
            print("    None")


# Made with Bob