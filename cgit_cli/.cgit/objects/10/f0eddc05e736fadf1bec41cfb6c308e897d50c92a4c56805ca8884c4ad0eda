#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Example test script for cgit CLI application.
Demonstrates basic functionality.
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.filesystem import CGitFileSystem

# Fix Windows console encoding issues
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')


def test_filesystem():
    """Test core filesystem functionality."""
    print("=" * 60)
    print("Testing CGit File System")
    print("=" * 60)
    
    # Create temporary directory for testing
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"\n✓ Created temporary test directory: {tmpdir}")
        
        # Test 1: Initialize repository
        print("\n[Test 1] Initializing repository...")
        fs = CGitFileSystem(tmpdir)
        result = fs.init_repository()
        assert result == True, "Repository initialization failed"
        print("✓ Repository initialized successfully")
        
        # Test 2: Check if initialized
        print("\n[Test 2] Checking if repository is initialized...")
        assert fs.is_initialized() == True, "Repository not detected as initialized"
        print("✓ Repository detected as initialized")
        
        # Test 3: Create and add a test file
        print("\n[Test 3] Creating and adding a test file...")
        test_file = Path(tmpdir) / "test.txt"
        test_content = "Hello, cgit!\nThis is a test file.\n"
        test_file.write_text(test_content)
        print(f"✓ Created test file: {test_file}")
        
        # Test 4: Hash the file
        print("\n[Test 4] Hashing the file...")
        content, file_hash = fs.read_and_hash_file(str(test_file))
        print(f"✓ File hash: {file_hash}")
        assert content == test_content, "File content mismatch"
        print("✓ File content matches")
        
        # Test 5: Add file to repository
        print("\n[Test 5] Adding file to repository...")
        added_hash = fs.add_file(str(test_file))
        assert added_hash == file_hash, "Hash mismatch"
        print(f"✓ File added with hash: {added_hash}")
        
        # Test 6: Check if object exists
        print("\n[Test 6] Checking if object exists...")
        assert fs.object_exists(file_hash) == True, "Object not found"
        print("✓ Object exists in repository")
        
        # Test 7: Read object back
        print("\n[Test 7] Reading object from repository...")
        retrieved_content = fs.read_object(file_hash)
        assert retrieved_content == test_content, "Retrieved content mismatch"
        print("✓ Object content matches original")
        
        # Test 8: Test error handling - non-existent file
        print("\n[Test 8] Testing error handling for non-existent file...")
        try:
            fs.read_and_hash_file("nonexistent.txt")
            assert False, "Should have raised FileNotFoundError"
        except FileNotFoundError:
            print("✓ Correctly raised FileNotFoundError")
        
        # Test 9: Test error handling - non-existent object
        print("\n[Test 9] Testing error handling for non-existent object...")
        try:
            fs.read_object("0" * 64)
            assert False, "Should have raised FileNotFoundError"
        except FileNotFoundError:
            print("✓ Correctly raised FileNotFoundError")
        
        print("\n" + "=" * 60)
        print("All tests passed! ✓")
        print("=" * 60)


def test_hash_consistency():
    """Test that hashing is consistent."""
    print("\n" + "=" * 60)
    print("Testing Hash Consistency")
    print("=" * 60)
    
    fs = CGitFileSystem()
    
    test_strings = [
        "Hello, World!",
        "The quick brown fox jumps over the lazy dog",
        "cgit version control system",
        "",  # Empty string
        "Line 1\nLine 2\nLine 3\n",
    ]
    
    for i, test_str in enumerate(test_strings, 1):
        print(f"\n[Test {i}] Hashing: {repr(test_str[:50])}")
        hash1 = fs.hash_file_content(test_str)
        hash2 = fs.hash_file_content(test_str)
        assert hash1 == hash2, "Hash inconsistency detected"
        print(f"✓ Hash: {hash1}")
        print("✓ Hashing is consistent")
    
    print("\n" + "=" * 60)
    print("Hash consistency tests passed! ✓")
    print("=" * 60)


def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("CGIT CLI TEST SUITE")
    print("=" * 60)
    
    try:
        test_filesystem()
        test_hash_consistency()
        
        print("\n" + "=" * 60)
        print("ALL TESTS PASSED! ✓✓✓")
        print("=" * 60)
        return 0
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())

# Made with Bob
