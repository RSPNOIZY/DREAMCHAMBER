#!/usr/bin/env python3
"""
🧪 Bobby Test Suite - Comprehensive Testing Framework
Advanced testing for all Bobby agents and components.
"""

import os
import sys
import unittest
import tempfile
import shutil
from pathlib import Path
import json
from unittest.mock import Mock, patch, MagicMock

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from bobby_ai import BobbyAI
    from bobby_commander import BobbyCommander
except ImportError as e:
    print(f"Warning: Could not import all modules: {e}")

class TestBobbyAI(unittest.TestCase):
    """Test suite for Bobby AI Agent"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.ai = BobbyAI()
        
    def tearDown(self):
        """Clean up test environment"""
        shutil.rmtree(self.test_dir, ignore_errors=True)
        
    def test_folder_pattern_extraction(self):
        """Test folder name pattern extraction"""
        patterns = self.ai.extract_name_pattern("test-folder_123")
        self.assertIn("contains_numbers", patterns)
        self.assertIn("hyphenated", patterns)
        self.assertIn("underscored", patterns)
        
    def test_content_type_detection(self):
        """Test content type detection"""
        # Create test folder with Python files
        test_folder = Path(self.test_dir) / "python_project"
        test_folder.mkdir()
        (test_folder / "main.py").touch()
        (test_folder / "utils.py").touch()
        
        content_type = self.ai.detect_content_type(str(test_folder))
        self.assertEqual(content_type, "code")
        
    def test_folder_size_categorization(self):
        """Test folder size categorization"""
        test_folder = Path(self.test_dir) / "small_folder"
        test_folder.mkdir()
        (test_folder / "small_file.txt").write_text("small content")
        
        size_category = self.ai.categorize_folder_size(str(test_folder))
        self.assertEqual(size_category, "small")
        
    def test_learning_from_actions(self):
        """Test AI learning mechanism"""
        analysis = {
            "name_pattern": ["test_pattern"],
            "content_type": "code",
            "size_category": "small"
        }
        
        # Simulate successful action
        self.ai.learn_from_action("/test/folder", analysis, "apply_icon", True)
        
        # Check if learning data was updated
        self.assertIn("test_pattern", self.ai.learning_data["folder_patterns"])
        pattern_data = self.ai.learning_data["folder_patterns"]["test_pattern"]
        self.assertEqual(pattern_data["successes"], 1)
        self.assertEqual(pattern_data["total_attempts"], 1)
        
    def test_smart_exclude_patterns(self):
        """Test smart exclude pattern generation"""
        patterns = self.ai.smart_exclude_patterns()
        self.assertIn(".git", patterns)
        self.assertIn(".DS_Store", patterns)
        
    def test_batch_size_optimization(self):
        """Test AI batch size optimization"""
        small_batch = self.ai.optimize_batch_size(30)
        large_batch = self.ai.optimize_batch_size(2000)
        
        self.assertLess(small_batch, large_batch)
        self.assertGreater(small_batch, 0)

class TestBobbyCommander(unittest.TestCase):
    """Test suite for Bobby Commander"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.commander = BobbyCommander()
        
        # Mock configuration
        self.commander.config = {
            "bobby_icon_path": "/fake/icon.png",
            "target_root": self.test_dir,
            "icon_file_name": "Icon\r",
            "exclude_patterns": [".git", ".DS_Store"],
            "log_file": "test_ritual.log"
        }
        
    def tearDown(self):
        """Clean up test environment"""
        shutil.rmtree(self.test_dir, ignore_errors=True)
        if Path("test_ritual.log").exists():
            Path("test_ritual.log").unlink()
            
    def test_config_loading(self):
        """Test configuration loading"""
        config = self.commander.load_config()
        self.assertIsInstance(config, dict)
        self.assertIn("bobby_icon_path", config)
        self.assertIn("target_root", config)
        
    def test_logging_functionality(self):
        """Test logging functionality"""
        self.commander.log("Test message", "INFO")
        
        # Check if log file was created and contains message
        if Path(self.commander.config["log_file"]).exists():
            with open(self.commander.config["log_file"], 'r') as f:
                content = f.read()
                self.assertIn("Test message", content)
                
    @patch('subprocess.run')
    def test_dependency_checking(self, mock_subprocess):
        """Test dependency checking"""
        # Mock successful fileicon check
        mock_subprocess.return_value = Mock(returncode=0)
        result = self.commander.check_dependencies()
        self.assertTrue(result)
        
        # Mock failed fileicon check
        mock_subprocess.side_effect = FileNotFoundError()
        result = self.commander.check_dependencies()
        self.assertFalse(result)
        
    def test_path_validation(self):
        """Test path validation"""
        # Create test files
        Path(self.commander.config["bobby_icon_path"]).parent.mkdir(parents=True, exist_ok=True)
        Path(self.commander.config["bobby_icon_path"]).touch()
        
        result = self.commander.validate_paths()
        self.assertTrue(result)
        
    def test_progress_bar(self):
        """Test progress bar functionality"""
        # This should not raise any exceptions
        self.commander.ritual_progress_bar(50, 100)
        self.commander.ritual_progress_bar(100, 100)

class TestBobbyIntegration(unittest.TestCase):
    """Integration tests for Bobby system"""
    
    def setUp(self):
        """Set up integration test environment"""
        self.test_dir = tempfile.mkdtemp()
        
    def tearDown(self):
        """Clean up integration test environment"""
        shutil.rmtree(self.test_dir, ignore_errors=True)
        
    def test_config_file_creation(self):
        """Test configuration file creation and loading"""
        config_data = {
            "bobby_icon_path": "/test/icon.png",
            "target_root": "/test/target",
            "auto_backup": True
        }
        
        config_path = Path(self.test_dir) / "test_config.json"
        with open(config_path, 'w') as f:
            json.dump(config_data, f)
            
        # Load and verify
        with open(config_path, 'r') as f:
            loaded_config = json.load(f)
            
        self.assertEqual(loaded_config["bobby_icon_path"], "/test/icon.png")
        self.assertTrue(loaded_config["auto_backup"])
        
    def test_ai_data_persistence(self):
        """Test AI learning data persistence"""
        ai = BobbyAI()
        
        # Add some learning data
        analysis = {
            "name_pattern": ["test"],
            "content_type": "mixed",
            "size_category": "small"
        }
        
        ai.learn_from_action("/test", analysis, "apply", True)
        
        # Save and reload
        ai.save_learning_data()
        new_ai = BobbyAI()
        
        # Verify data persisted
        self.assertIn("test", new_ai.learning_data["folder_patterns"])

class TestBobbyPerformance(unittest.TestCase):
    """Performance tests for Bobby system"""
    
    def test_large_folder_handling(self):
        """Test handling of large numbers of folders"""
        test_dir = tempfile.mkdtemp()
        
        try:
            # Create many test folders
            for i in range(100):
                folder_path = Path(test_dir) / f"test_folder_{i:03d}"
                folder_path.mkdir()
                
            # Test AI analysis performance
            ai = BobbyAI()
            start_time = time.time()
            
            for folder in Path(test_dir).iterdir():
                if folder.is_dir():
                    analysis = ai.analyze_folder_structure(str(folder))
                    self.assertIsInstance(analysis, dict)
                    
            end_time = time.time()
            processing_time = end_time - start_time
            
            # Should process 100 folders in reasonable time (< 5 seconds)
            self.assertLess(processing_time, 5.0)
            
        finally:
            shutil.rmtree(test_dir, ignore_errors=True)

def run_comprehensive_tests():
    """Run all Bobby tests with detailed reporting"""
    print("🧪 Bobby Test Suite - Comprehensive Testing")
    print("=" * 50)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestBobbyAI,
        TestBobbyCommander,
        TestBobbyIntegration,
        TestBobbyPerformance
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
        
    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(test_suite)
    
    # Print summary
    print("\n" + "=" * 50)
    print("🧪 Test Results Summary")
    print("=" * 50)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print("\n❌ Failures:")
        for test, traceback in result.failures:
            print(f"  - {test}")
            
    if result.errors:
        print("\n💥 Errors:")
        for test, traceback in result.errors:
            print(f"  - {test}")
            
    if result.wasSuccessful():
        print("\n✅ All tests passed! Bobby system is ready for action!")
    else:
        print("\n⚠️ Some tests failed. Check the details above.")
        
    return result.wasSuccessful()

def run_quick_tests():
    """Run a quick subset of tests"""
    print("⚡ Bobby Quick Test Suite")
    print("=" * 25)
    
    # Just run basic functionality tests
    suite = unittest.TestSuite()
    suite.addTest(TestBobbyAI('test_folder_pattern_extraction'))
    suite.addTest(TestBobbyCommander('test_config_loading'))
    suite.addTest(TestBobbyIntegration('test_config_file_creation'))
    
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    
    return result.wasSuccessful()

def main():
    """Main test runner"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Bobby Test Suite")
    parser.add_argument("--quick", action="store_true", help="Run quick tests only")
    parser.add_argument("--performance", action="store_true", help="Run performance tests only")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    if args.quick:
        success = run_quick_tests()
    elif args.performance:
        suite = unittest.TestLoader().loadTestsFromTestCase(TestBobbyPerformance)
        runner = unittest.TextTestRunner(verbosity=2 if args.verbose else 1)
        result = runner.run(suite)
        success = result.wasSuccessful()
    else:
        success = run_comprehensive_tests()
        
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    import time
    main()