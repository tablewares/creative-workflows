"""Branch management commands for cgit CLI."""

from typing import Optional
import requests
from cgit_cli.config import Config
from cgit_cli.core.id_manager import IDManager


class BranchCommands:
    """Handle branch management commands."""
    
    def __init__(self, config: Optional[Config] = None):
        """
        Initialize branch commands.
        
        Args:
            config: Configuration object (optional)
        """
        self.config = config or Config()
        self.id_manager = IDManager()
        self.base_url = self.id_manager.get_remote_url() or self.config.get('api_url', 'http://localhost:3000')
        self.base_url = self.base_url.rstrip('/')
        self.session = requests.Session()
        self._load_cookies()
    
    def _load_cookies(self):
        """Load cookies from file."""
        import json
        from pathlib import Path
        
        cookie_file = Path(self.config.get('cookie_file', 'cookies.txt'))
        if cookie_file.exists():
            try:
                with open(cookie_file, 'r') as f:
                    cookies_data = json.load(f)
                    for cookie in cookies_data:
                        self.session.cookies.set(
                            cookie['name'],
                            cookie['value'],
                            domain=cookie.get('domain'),
                            path=cookie.get('path', '/')
                        )
            except Exception:
                pass
    
    def _make_request(self, method: str, endpoint: str, data: Optional[dict] = None) -> dict:
        """
        Make HTTP request.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            data: Request body data
            
        Returns:
            Response data as dictionary
            
        Raises:
            Exception: If request fails
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            response.raise_for_status()
            
            if response.text:
                return response.json()
            return {}
            
        except requests.exceptions.HTTPError as e:
            try:
                error_data = e.response.json()
                error_msg = error_data.get('error', str(e))
            except Exception:
                error_msg = str(e)
            
            raise Exception(f"HTTP {e.response.status_code}: {error_msg}")
        
        except requests.exceptions.ConnectionError:
            raise Exception(f"Connection error: Could not connect to {self.base_url}")
        
        except requests.exceptions.Timeout:
            raise Exception("Request timeout: Server did not respond in time")
        
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {e}")
    
    def create(self, name: str, project_name: Optional[str] = None, head_commit_id: Optional[str] = None) -> bool:
        """
        Create a new branch (git-like: cgit branch <name>).
        
        Args:
            name: Branch name
            project_name: Project name (optional, uses current project if not specified)
            head_commit_id: Head commit ID (optional)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get project name
            if not project_name:
                project_name = self.config.get('current_project')
                if not project_name:
                    print("✗ No project specified and no current project set")
                    print("  Use 'cgit project use <name>' or specify --project")
                    return False
            
            # Get project ID
            project_id = self.id_manager.get_project_id(project_name)
            if not project_id:
                print(f"✗ Project '{project_name}' not found locally")
                return False
            
            # Get user ID
            user_id = self.id_manager.get_user_id()
            if not user_id:
                print("✗ No user ID found. Please login first.")
                return False
            
            # Get head commit ID if not provided
            if not head_commit_id:
                # Try to get the latest commit from current branch or use a default
                current_branch = self.config.get('current_branch', 'main')
                head_commit_id = self.id_manager.get_latest_commit_id(project_name, current_branch)
                
                if not head_commit_id:
                    # Use a placeholder commit ID for new branches
                    head_commit_id = "00000000-0000-0000-0000-000000000000"
            
            data = {
                "projectId": project_id,
                "name": name,
                "headCommitId": head_commit_id,
                "createdBy": user_id
            }
            
            response = self._make_request("POST", "/api/branches", data)
            
            # Store branch ID
            branch_id = response.get('id')
            if branch_id:
                self.id_manager.set_branch_id(project_name, name, branch_id)
                print(f"✓ Created branch: {name}")
                print(f"  ID: {branch_id}")
                print(f"  Project: {project_name}")
                print(f"  Head Commit: {head_commit_id}")
                return True
            else:
                print("✗ Branch created but no ID returned")
                return False
            
        except Exception as e:
            print(f"✗ Failed to create branch: {e}")
            return False
    
    def list(self, project_name: Optional[str] = None) -> bool:
        """
        List all branches (git-like: cgit branch -a).
        
        Args:
            project_name: Project name (optional, uses current project if not specified)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get project name
            if not project_name:
                project_name = self.config.get('current_project')
                if not project_name:
                    print("✗ No project specified and no current project set")
                    return False
            
            # Get project ID
            project_id = self.id_manager.get_project_id(project_name)
            if not project_id:
                print(f"✗ Project '{project_name}' not found locally")
                return False
            
            response = self._make_request("GET", f"/api/projects/{project_id}/branches")
            
            branches = response.get('branches', [])
            current_branch = self.config.get('current_branch')
            
            if not branches:
                print(f"No branches found for project '{project_name}'")
                return True
            
            print(f"Branches for project '{project_name}':")
            for branch in branches:
                branch_name = branch.get('name', 'N/A')
                marker = '*' if branch_name == current_branch else ' '
                print(f"  {marker} {branch_name}")
                print(f"    ID: {branch.get('id', 'N/A')}")
                print(f"    Head Commit: {branch.get('head_commit_id', 'N/A')}")
                print()
            
            return True
            
        except Exception as e:
            print(f"✗ Failed to list branches: {e}")
            return False
    
    def checkout(self, name: str, project_name: Optional[str] = None) -> bool:
        """
        Switch to a branch (git-like: cgit checkout <branch>).
        
        Args:
            name: Branch name
            project_name: Project name (optional, uses current project if not specified)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get project name
            if not project_name:
                project_name = self.config.get('current_project')
                if not project_name:
                    print("✗ No project specified and no current project set")
                    return False
            
            # Check if branch exists locally
            branch_id = self.id_manager.get_branch_id(project_name, name)
            if not branch_id:
                print(f"✗ Branch '{name}' not found locally for project '{project_name}'")
                print("  Use 'cgit branch list' to see available branches")
                return False
            
            # Set as current branch
            self.config.set('current_branch', name)
            self.config.save()
            
            print(f"✓ Switched to branch: {name}")
            print(f"  Project: {project_name}")
            print(f"  Branch ID: {branch_id}")
            
            return True
            
        except Exception as e:
            print(f"✗ Failed to checkout branch: {e}")
            return False
    
    def current(self) -> bool:
        """
        Show current branch (git-like: cgit branch --show-current).
        
        Returns:
            True if successful, False otherwise
        """
        try:
            current_branch = self.config.get('current_branch')
            current_project = self.config.get('current_project')
            
            if not current_branch:
                print("No current branch set")
                return False
            
            print(f"Current branch: {current_branch}")
            if current_project:
                print(f"  Project: {current_project}")
                branch_id = self.id_manager.get_branch_id(current_project, current_branch)
                if branch_id:
                    print(f"  Branch ID: {branch_id}")
            
            return True
            
        except Exception as e:
            print(f"✗ Failed to get current branch: {e}")
            return False
    
    def delete(self, name: str, project_name: Optional[str] = None) -> bool:
        """
        Delete a branch (git-like: cgit branch -d <name>).
        
        Args:
            name: Branch name
            project_name: Project name (optional, uses current project if not specified)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get project name
            if not project_name:
                project_name = self.config.get('current_project')
                if not project_name:
                    print("✗ No project specified and no current project set")
                    return False
            
            # Get branch ID
            branch_id = self.id_manager.get_branch_id(project_name, name)
            if not branch_id:
                print(f"✗ Branch '{name}' not found locally")
                return False
            
            # Check if trying to delete current branch
            current_branch = self.config.get('current_branch')
            if name == current_branch:
                print(f"✗ Cannot delete current branch '{name}'")
                print("  Switch to another branch first")
                return False
            
            response = self._make_request("DELETE", f"/api/branches/{branch_id}")
            
            print(f"✓ Deleted branch: {name}")
            print(f"  Project: {project_name}")
            
            return True
            
        except Exception as e:
            print(f"✗ Failed to delete branch: {e}")
            return False


# Made with Bob