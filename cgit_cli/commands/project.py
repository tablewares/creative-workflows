"""Project management commands for cgit CLI."""

from typing import Optional
import requests
from cgit_cli.config import Config
from core.id_manager import IDManager


class ProjectCommands:
    """Handle project management commands."""
    
    def __init__(self, config: Optional[Config] = None):
        """
        Initialize project commands.
        
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
    
    def create(self, name: str, description: str = "") -> bool:
        """
        Create a new project (git-like: cgit project create <name>).
        
        Args:
            name: Project name
            description: Project description (optional)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            user_id = self.id_manager.get_user_id()
            
            if not user_id:
                print("✗ No user ID found. Please login first.")
                return False
            
            data = {
                "name": name,
                "description": description,
                "createdBy": user_id
            }
            
            response = self._make_request("POST", "/api/projects", data)
            
            # Store project ID
            project_id = response.get('id')
            if project_id:
                self.id_manager.set_project_id(name, project_id)
                print(f"✓ Created project: {name}")
                print(f"  ID: {project_id}")
                print(f"  Description: {description or '(none)'}")
                return True
            else:
                print("✗ Project created but no ID returned")
                return False
            
        except Exception as e:
            print(f"✗ Failed to create project: {e}")
            return False
    
    def list(self) -> bool:
        """
        List all projects (git-like: cgit project list).
        
        Returns:
            True if successful, False otherwise
        """
        try:
            response = self._make_request("GET", "/api/projects")
            
            projects = response.get('projects', [])
            
            if not projects:
                print("No projects found")
                return True
            
            print(f"Projects ({len(projects)}):")
            for project in projects:
                print(f"  • {project.get('name', 'N/A')}")
                print(f"    ID: {project.get('id', 'N/A')}")
                print(f"    Description: {project.get('description', '(none)')}")
                print(f"    Created: {project.get('created_at', 'N/A')}")
                print()
            
            return True
            
        except Exception as e:
            print(f"✗ Failed to list projects: {e}")
            return False
    
    def show(self, name: str) -> bool:
        """
        Show project details (git-like: cgit project show <name>).
        
        Args:
            name: Project name
            
        Returns:
            True if successful, False otherwise
        """
        try:
            project_id = self.id_manager.get_project_id(name)
            
            if not project_id:
                print(f"✗ Project '{name}' not found locally. Use 'cgit project list' to see available projects.")
                return False
            
            response = self._make_request("GET", f"/api/projects/{project_id}")
            
            print(f"Project: {response.get('name', 'N/A')}")
            print(f"  ID: {response.get('id', 'N/A')}")
            print(f"  Description: {response.get('description', '(none)')}")
            print(f"  Created By: {response.get('created_by', 'N/A')}")
            print(f"  Created At: {response.get('created_at', 'N/A')}")
            
            return True
            
        except Exception as e:
            print(f"✗ Failed to show project: {e}")
            return False
    
    def set_current(self, name: str) -> bool:
        """
        Set current project (git-like: cgit project use <name>).
        
        Args:
            name: Project name
            
        Returns:
            True if successful, False otherwise
        """
        try:
            project_id = self.id_manager.get_project_id(name)
            
            if not project_id:
                print(f"✗ Project '{name}' not found locally. Create it first with 'cgit project create'.")
                return False
            
            self.config.set('current_project', name)
            self.config.save()
            
            print(f"✓ Switched to project: {name}")
            print(f"  ID: {project_id}")
            
            return True
            
        except Exception as e:
            print(f"✗ Failed to set current project: {e}")
            return False
    
    def current(self) -> bool:
        """
        Show current project (git-like: cgit project current).
        
        Returns:
            True if successful, False otherwise
        """
        try:
            current_project = self.config.get('current_project')
            
            if not current_project:
                print("No current project set")
                print("Use 'cgit project use <name>' to set one")
                return False
            
            project_id = self.id_manager.get_project_id(current_project)
            
            print(f"Current project: {current_project}")
            if project_id:
                print(f"  ID: {project_id}")
            
            return True
            
        except Exception as e:
            print(f"✗ Failed to get current project: {e}")
            return False


# Made with Bob