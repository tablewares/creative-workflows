"""Authentication commands for cgit CLI."""

import json
from pathlib import Path
from typing import Optional
import requests
from config import Config
from core.id_manager import IDManager


class AuthCommands:
    """Handle authentication-related commands."""
    
    def __init__(self, config: Optional[Config] = None):
        """
        Initialize auth commands.
        
        Args:
            config: Configuration object (optional)
        """
        self.config = config or Config()
        self.id_manager = IDManager()
        self.base_url = self.config.get('api_url', 'http://localhost:3000').rstrip('/')
        self.cookie_file = Path(self.config.get('cookie_file', 'cookies.txt'))
        self.session = requests.Session()
        self._load_cookies()
    
    def _load_cookies(self):
        """Load cookies from file."""
        if self.cookie_file.exists():
            try:
                with open(self.cookie_file, 'r') as f:
                    cookies_data = json.load(f)
                    for cookie in cookies_data:
                        self.session.cookies.set(
                            cookie['name'],
                            cookie['value'],
                            domain=cookie.get('domain'),
                            path=cookie.get('path', '/')
                        )
            except Exception:
                pass  # File might be empty or corrupted
    
    def _save_cookies(self):
        """Save cookies to file."""
        try:
            cookies_data = []
            for cookie in self.session.cookies:
                cookies_data.append({
                    'name': cookie.name,
                    'value': cookie.value,
                    'domain': cookie.domain,
                    'path': cookie.path
                })
            
            with open(self.cookie_file, 'w') as f:
                json.dump(cookies_data, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save cookies: {e}")
    
    def _clear_cookies(self):
        """Clear all cookies."""
        self.session.cookies.clear()
        self._save_cookies()
    
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
            
            # Save cookies after request
            self._save_cookies()
            
            # Raise exception for bad status codes
            response.raise_for_status()
            
            # Parse response
            if response.text:
                return response.json()
            return {}
            
        except requests.exceptions.HTTPError as e:
            # Try to parse error response
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
    
    def register(self, name: str, user_type: str, password: str) -> bool:
        """
        Register a new user.
        
        Args:
            name: Username
            user_type: User type ('ai' or 'human')
            password: User password
            
        Returns:
            True if successful, False otherwise
        """
        if user_type not in ['ai', 'human']:
            print(f"Error: Invalid user type '{user_type}'. Must be 'ai' or 'human'.")
            return False
        
        try:
            data = {
                "name": name,
                "type": user_type,
                "password": password
            }
            
            response = self._make_request("POST", "/api/auth/register", data)
            
            # Store user ID
            user_data = response.get('user', {})
            user_id = user_data.get('id')
            if user_id:
                self.id_manager.set_user_id(user_id)
            
            print(f"Successfully registered user: {name}")
            if 'message' in response:
                print(f"  {response['message']}")
            if user_id:
                print(f"  User ID: {user_id}")
            
            return True
            
        except Exception as e:
            print(f"Registration failed: {e}")
            return False
    
    def login(self, name: str, password: str) -> bool:
        """
        Login a user.
        
        Args:
            name: Username
            password: User password
            
        Returns:
            True if successful, False otherwise
        """
        try:
            data = {
                "name": name,
                "password": password
            }
            
            response = self._make_request("POST", "/api/auth/login", data)
            
            # Store user ID
            user_data = response.get('user', {})
            user_id = user_data.get('id')
            if user_id:
                self.id_manager.set_user_id(user_id)
            
            print(f"Successfully logged in as: {name}")
            if 'message' in response:
                print(f"  {response['message']}")
            if user_id:
                print(f"  User ID: {user_id}")
            
            # Store username in config
            self.config.set('current_user', name)
            self.config.save()
            
            return True
            
        except Exception as e:
            print(f"Login failed: {e}")
            return False
    
    def logout(self) -> bool:
        """
        Logout the current user.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            response = self._make_request("POST", "/api/auth/logout", {})
            
            print("Successfully logged out")
            if 'message' in response:
                print(f"  {response['message']}")
            
            # Clear cookies, user from config, and user ID
            self._clear_cookies()
            self.config.set('current_user', None)
            self.config.save()
            self.id_manager.set_user_id(None)
            
            return True
            
        except Exception as e:
            print(f"Logout failed: {e}")
            return False
    
    def profile(self) -> bool:
        """
        Get current user profile.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            response = self._make_request("GET", "/api/profile")
            
            # Store/update user ID
            user_data = response.get('user', response)
            user_id = user_data.get('id')
            if user_id:
                self.id_manager.set_user_id(user_id)
            
            print("User Profile:")
            print(f"  Name: {user_data.get('name', 'N/A')}")
            print(f"  Type: {user_data.get('type', 'N/A')}")
            print(f"  ID: {user_id or 'N/A'}")
            
            # Display any additional fields
            for key, value in user_data.items():
                if key not in ['name', 'type', 'id']:
                    print(f"  {key.capitalize()}: {value}")
            
            return True
            
        except Exception as e:
            print(f"Failed to get profile: {e}")
            return False
    
    def status(self) -> bool:
        """
        Show authentication status.
        
        Returns:
            True if logged in, False otherwise
        """
        current_user = self.config.get('current_user')
        
        if current_user:
            print(f"Logged in as: {current_user}")
            return True
        else:
            print("Not logged in")
            return False

# Made with Bob
