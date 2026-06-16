#!/usr/bin/env python3
"""
Test script for remote management and authentication commands.

This script tests:
1. User registration
2. User login
3. Remote URL management
4. ID storage and retrieval

Prerequisites:
- Server must be running on http://localhost:3000
- Run from cgit_cli directory
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from commands import AuthCommands, RemoteCommands
from config import Config
from core.id_manager import IDManager


def print_section(title):
    """Print a section header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_remote_management():
    """Test remote URL management."""
    print_section("Testing Remote Management")
    
    config = Config()
    remote_cmd = RemoteCommands(config)
    id_manager = IDManager()
    
    # Test 1: Add remote
    print("\n1. Adding remote 'origin'...")
    success = remote_cmd.add('origin', 'http://localhost:3000')
    assert success, "Failed to add remote"
    print("✓ Remote added successfully")
    
    # Test 2: Get remote URL
    print("\n2. Getting remote URL...")
    success = remote_cmd.get_url('origin')
    assert success, "Failed to get remote URL"
    
    # Verify in ID manager
    stored_url = id_manager.get_remote_url()
    assert stored_url == 'http://localhost:3000', f"URL mismatch: {stored_url}"
    print("✓ Remote URL verified in ID manager")
    
    # Test 3: Show remote details
    print("\n3. Showing remote details...")
    success = remote_cmd.show('origin')
    assert success, "Failed to show remote"
    print("✓ Remote details displayed")
    
    # Test 4: List remotes
    print("\n4. Listing remotes...")
    success = remote_cmd.list()
    assert success, "Failed to list remotes"
    print("✓ Remotes listed")
    
    # Test 5: Change remote URL
    print("\n5. Changing remote URL...")
    success = remote_cmd.set_url('origin', 'http://localhost:3000')
    assert success, "Failed to change remote URL"
    print("✓ Remote URL changed")
    
    print("\n✓ All remote management tests passed!")


def test_user_registration():
    """Test user registration."""
    print_section("Testing User Registration")
    
    config = Config()
    auth_cmd = AuthCommands(config)
    id_manager = IDManager()
    
    # Test 1: Register a human user
    print("\n1. Registering human user 'test_human'...")
    success = auth_cmd.register('test_human', 'human', 'TestPassword123!')
    assert success, "Failed to register human user"
    
    # Verify user ID was stored
    user_id = id_manager.get_user_id()
    assert user_id is not None, "User ID not stored"
    print(f"✓ Human user registered with ID: {user_id}")
    
    # Test 2: Register an AI user
    print("\n2. Registering AI user 'test_ai'...")
    success = auth_cmd.register('test_ai', 'ai', 'TestPassword123!')
    assert success, "Failed to register AI user"
    
    # Verify user ID was updated
    new_user_id = id_manager.get_user_id()
    assert new_user_id is not None, "User ID not stored"
    assert new_user_id != user_id, "User ID not updated"
    print(f"✓ AI user registered with ID: {new_user_id}")
    
    # Test 3: Try invalid user type
    print("\n3. Testing invalid user type...")
    success = auth_cmd.register('test_invalid', 'robot', 'TestPassword123!')
    assert not success, "Should fail with invalid user type"
    print("✓ Invalid user type rejected as expected")
    
    print("\n✓ All user registration tests passed!")


def test_user_login():
    """Test user login."""
    print_section("Testing User Login")
    
    config = Config()
    auth_cmd = AuthCommands(config)
    id_manager = IDManager()
    
    # First, ensure we have a user to login with
    print("\n1. Ensuring test user exists...")
    auth_cmd.register('test_login_user', 'human', 'SecurePass123!')
    
    # Test 2: Logout first
    print("\n2. Logging out any existing session...")
    auth_cmd.logout()
    print("✓ Logged out")
    
    # Test 3: Login with correct credentials
    print("\n3. Logging in with correct credentials...")
    success = auth_cmd.login('test_login_user', 'SecurePass123!')
    assert success, "Failed to login with correct credentials"
    
    # Verify user ID was stored
    user_id = id_manager.get_user_id()
    assert user_id is not None, "User ID not stored after login"
    print(f"✓ Logged in successfully with ID: {user_id}")
    
    # Test 4: Check authentication status
    print("\n4. Checking authentication status...")
    success = auth_cmd.status()
    assert success, "Should be logged in"
    print("✓ Authentication status confirmed")
    
    # Test 5: Get user profile
    print("\n5. Getting user profile...")
    success = auth_cmd.profile()
    assert success, "Failed to get profile"
    print("✓ Profile retrieved")
    
    # Test 6: Login with wrong password
    print("\n6. Testing login with wrong password...")
    success = auth_cmd.login('test_login_user', 'WrongPassword')
    assert not success, "Should fail with wrong password"
    print("✓ Wrong password rejected as expected")
    
    # Test 7: Logout
    print("\n7. Logging out...")
    success = auth_cmd.logout()
    assert success, "Failed to logout"
    
    # Verify user ID was cleared
    user_id = id_manager.get_user_id()
    assert user_id is None, "User ID not cleared after logout"
    print("✓ Logged out and user ID cleared")
    
    print("\n✓ All user login tests passed!")


def test_id_manager():
    """Test ID manager functionality."""
    print_section("Testing ID Manager")
    
    id_manager = IDManager()
    
    # Test 1: Display all IDs
    print("\n1. Displaying all stored IDs...")
    id_manager.display_all()
    print("✓ IDs displayed")
    
    # Test 2: Test project ID storage
    print("\n2. Testing project ID storage...")
    id_manager.set_project_id('test_project', 'proj-123-456')
    retrieved_id = id_manager.get_project_id('test_project')
    assert retrieved_id == 'proj-123-456', f"Project ID mismatch: {retrieved_id}"
    print("✓ Project ID stored and retrieved")
    
    # Test 3: Test branch ID storage
    print("\n3. Testing branch ID storage...")
    id_manager.set_branch_id('test_project', 'main', 'branch-789-012')
    retrieved_id = id_manager.get_branch_id('test_project', 'main')
    assert retrieved_id == 'branch-789-012', f"Branch ID mismatch: {retrieved_id}"
    print("✓ Branch ID stored and retrieved")
    
    # Test 4: Test commit ID storage
    print("\n4. Testing commit ID storage...")
    id_manager.add_commit_id('test_project', 'main', 'commit-111-222')
    id_manager.add_commit_id('test_project', 'main', 'commit-333-444')
    commits = id_manager.get_commit_ids('test_project', 'main')
    assert len(commits) == 2, f"Expected 2 commits, got {len(commits)}"
    latest = id_manager.get_latest_commit_id('test_project', 'main')
    assert latest == 'commit-333-444', f"Latest commit mismatch: {latest}"
    print("✓ Commit IDs stored and retrieved")
    
    # Test 5: List all projects
    print("\n5. Listing all projects...")
    projects = id_manager.list_projects()
    assert 'test_project' in projects, "Test project not found"
    print(f"✓ Found {len(projects)} project(s)")
    
    # Test 6: List all branches
    print("\n6. Listing all branches for test_project...")
    branches = id_manager.list_branches('test_project')
    assert 'main' in branches, "Main branch not found"
    print(f"✓ Found {len(branches)} branch(es)")
    
    print("\n✓ All ID manager tests passed!")


def run_all_tests():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("  CGIT CLI - Remote & Authentication Test Suite")
    print("=" * 60)
    print("\nPrerequisites:")
    print("  - Server running on http://localhost:3000")
    print("  - Run from cgit_cli directory")
    print("\nStarting tests...\n")
    
    try:
        # Test remote management
        test_remote_management()
        
        # Test user registration
        test_user_registration()
        
        # Test user login
        test_user_login()
        
        # Test ID manager
        test_id_manager()
        
        # Final summary
        print("\n" + "=" * 60)
        print("  ✓ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nTest Summary:")
        print("  ✓ Remote management")
        print("  ✓ User registration")
        print("  ✓ User login/logout")
        print("  ✓ ID manager functionality")
        print("\n")
        
        return True
        
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n✗ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)


# Made with Bob