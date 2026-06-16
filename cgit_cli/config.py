"""Configuration management for cgit CLI."""

import json
from pathlib import Path
from typing import Any, Optional


class Config:
    """Manage cgit configuration."""
    
    DEFAULT_CONFIG = {
        'api_url': 'http://localhost:3000',
        'cookie_file': 'cookies.txt',
        'current_user': None
    }
    
    def __init__(self, config_file: str = '.cgit/config.json'):
        """
        Initialize configuration.
        
        Args:
            config_file: Path to configuration file
        """
        self.config_file = Path(config_file)
        self.config = self.DEFAULT_CONFIG.copy()
        self.load()
    
    def load(self):
        """Load configuration from file."""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    self.config.update(loaded_config)
            except Exception as e:
                print(f"Warning: Could not load config: {e}")
    
    def save(self):
        """Save configuration to file."""
        try:
            # Create parent directory if it doesn't exist
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save config: {e}")
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value.
        
        Args:
            key: Configuration key
            default: Default value if key not found
            
        Returns:
            Configuration value
        """
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any):
        """
        Set configuration value.
        
        Args:
            key: Configuration key
            value: Configuration value
        """
        self.config[key] = value
    
    def get_all(self) -> dict:
        """
        Get all configuration values.
        
        Returns:
            Dictionary of all configuration
        """
        return self.config.copy()
    
    def reset(self):
        """Reset configuration to defaults."""
        self.config = self.DEFAULT_CONFIG.copy()
        self.save()

# Made with Bob
