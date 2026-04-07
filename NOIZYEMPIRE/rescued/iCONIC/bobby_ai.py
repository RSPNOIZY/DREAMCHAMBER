#!/usr/bin/env python3
"""
🔥 Bobby AI Agent - Intelligent Icon Management
Advanced AI-powered Bobby automation with machine learning insights.
"""

import os
import json
import time
from pathlib import Path
import subprocess
from datetime import datetime, timedelta
import hashlib
from collections import defaultdict

class BobbyAI:
    def __init__(self):
        self.learning_data = self.load_learning_data()
        self.folder_patterns = defaultdict(int)
        self.icon_history = {}
        self.performance_metrics = {
            "speed_trends": [],
            "success_rates": [],
            "folder_types": defaultdict(int)
        }
        
    def load_learning_data(self):
        """Load AI learning data"""
        data_path = Path("bobby_ai_data.json")
        if data_path.exists():
            try:
                with open(data_path, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {
            "folder_patterns": {},
            "success_history": [],
            "optimization_data": {},
            "learned_preferences": {}
        }
        
    def save_learning_data(self):
        """Save AI learning data"""
        try:
            with open("bobby_ai_data.json", 'w') as f:
                json.dump(self.learning_data, f, indent=2)
        except Exception as e:
            print(f"Failed to save learning data: {e}")
            
    def analyze_folder_structure(self, path):
        """AI analysis of folder structure"""
        analysis = {
            "depth": len(Path(path).parts),
            "name_pattern": self.extract_name_pattern(Path(path).name),
            "creation_time": os.path.getctime(path) if os.path.exists(path) else 0,
            "size_category": self.categorize_folder_size(path),
            "content_type": self.detect_content_type(path)
        }
        return analysis
        
    def extract_name_pattern(self, name):
        """Extract naming patterns from folder names"""
        patterns = []
        
        # Common patterns
        if name.startswith('.'):
            patterns.append("hidden")
        if name.isupper():
            patterns.append("uppercase")
        if name.islower():
            patterns.append("lowercase")
        if any(char.isdigit() for char in name):
            patterns.append("contains_numbers")
        if '-' in name:
            patterns.append("hyphenated")
        if '_' in name:
            patterns.append("underscored")
        if ' ' in name:
            patterns.append("spaced")
            
        # Content hints from name
        code_keywords = ['src', 'source', 'code', 'dev', 'project', 'git']
        docs_keywords = ['doc', 'docs', 'documentation', 'readme', 'manual']
        media_keywords = ['img', 'image', 'video', 'audio', 'media', 'photo']
        
        name_lower = name.lower()
        if any(keyword in name_lower for keyword in code_keywords):
            patterns.append("code_related")
        if any(keyword in name_lower for keyword in docs_keywords):
            patterns.append("docs_related")
        if any(keyword in name_lower for keyword in media_keywords):
            patterns.append("media_related")
            
        return patterns
        
    def categorize_folder_size(self, path):
        """Categorize folder by size"""
        try:
            total_size = sum(
                os.path.getsize(os.path.join(dirpath, filename))
                for dirpath, dirnames, filenames in os.walk(path)
                for filename in filenames
            )
            
            if total_size < 1024 * 1024:  # < 1MB
                return "small"
            elif total_size < 100 * 1024 * 1024:  # < 100MB
                return "medium"
            elif total_size < 1024 * 1024 * 1024:  # < 1GB
                return "large"
            else:
                return "huge"
        except:
            return "unknown"
            
    def detect_content_type(self, path):
        """Detect primary content type in folder"""
        content_counts = defaultdict(int)
        
        try:
            for root, dirs, files in os.walk(path):
                for file in files[:50]:  # Sample first 50 files
                    ext = Path(file).suffix.lower()
                    if ext in ['.py', '.js', '.java', '.cpp', '.c', '.h']:
                        content_counts['code'] += 1
                    elif ext in ['.txt', '.md', '.pdf', '.doc', '.docx']:
                        content_counts['documents'] += 1
                    elif ext in ['.jpg', '.png', '.gif', '.mp4', '.mov']:
                        content_counts['media'] += 1
                    elif ext in ['.zip', '.tar', '.gz', '.rar']:
                        content_counts['archives'] += 1
                        
            if content_counts:
                return max(content_counts, key=content_counts.get)
        except:
            pass
            
        return "mixed"
        
    def should_apply_icon(self, folder_path, analysis):
        """AI decision on whether to apply icon"""
        # Base decision on learned patterns
        confidence = 0.5
        
        # Adjust based on folder patterns
        for pattern in analysis["name_pattern"]:
            pattern_history = self.learning_data["folder_patterns"].get(pattern, {})
            success_rate = pattern_history.get("success_rate", 0.5)
            confidence = (confidence + success_rate) / 2
            
        # Adjust based on content type
        content_preferences = self.learning_data["learned_preferences"].get("content_types", {})
        content_preference = content_preferences.get(analysis["content_type"], 0.5)
        confidence = (confidence + content_preference) / 2
        
        # Adjust based on folder age
        folder_age_days = (time.time() - analysis["creation_time"]) / (24 * 3600)
        if folder_age_days < 7:  # Recent folders more likely to need icons
            confidence += 0.1
        elif folder_age_days > 365:  # Very old folders less likely
            confidence -= 0.1
            
        return confidence > 0.6
        
    def learn_from_action(self, folder_path, analysis, action_taken, success):
        """Learn from performed actions"""
        # Update pattern success rates
        for pattern in analysis["name_pattern"]:
            if pattern not in self.learning_data["folder_patterns"]:
                self.learning_data["folder_patterns"][pattern] = {
                    "total_attempts": 0,
                    "successes": 0,
                    "success_rate": 0.5
                }
                
            pattern_data = self.learning_data["folder_patterns"][pattern]
            pattern_data["total_attempts"] += 1
            if success:
                pattern_data["successes"] += 1
            pattern_data["success_rate"] = pattern_data["successes"] / pattern_data["total_attempts"]
            
        # Update content type preferences
        if "content_types" not in self.learning_data["learned_preferences"]:
            self.learning_data["learned_preferences"]["content_types"] = {}
            
        content_prefs = self.learning_data["learned_preferences"]["content_types"]
        content_type = analysis["content_type"]
        
        if content_type not in content_prefs:
            content_prefs[content_type] = 0.5
            
        # Adjust preference based on success
        if success:
            content_prefs[content_type] = min(1.0, content_prefs[content_type] + 0.1)
        else:
            content_prefs[content_type] = max(0.0, content_prefs[content_type] - 0.1)
            
        # Record action in history
        self.learning_data["success_history"].append({
            "timestamp": time.time(),
            "folder_path": folder_path,
            "analysis": analysis,
            "action": action_taken,
            "success": success
        })
        
        # Keep only recent history (last 1000 actions)
        if len(self.learning_data["success_history"]) > 1000:
            self.learning_data["success_history"] = self.learning_data["success_history"][-1000:]
            
    def generate_insights(self):
        """Generate AI insights about Bobby icon usage"""
        insights = []
        
        # Pattern insights
        if self.learning_data["folder_patterns"]:
            best_pattern = max(
                self.learning_data["folder_patterns"].items(),
                key=lambda x: x[1]["success_rate"]
            )
            worst_pattern = min(
                self.learning_data["folder_patterns"].items(),
                key=lambda x: x[1]["success_rate"]
            )
            
            insights.append(f"🎯 Best performing pattern: {best_pattern[0]} ({best_pattern[1]['success_rate']:.1%} success)")
            insights.append(f"⚠️ Challenging pattern: {worst_pattern[0]} ({worst_pattern[1]['success_rate']:.1%} success)")
            
        # Content type insights
        content_prefs = self.learning_data["learned_preferences"].get("content_types", {})
        if content_prefs:
            best_content = max(content_prefs.items(), key=lambda x: x[1])
            insights.append(f"📁 Best content type for Bobby icons: {best_content[0]} (preference: {best_content[1]:.1%})")
            
        # Performance trends
        recent_history = self.learning_data["success_history"][-100:]
        if recent_history:
            recent_success_rate = sum(1 for action in recent_history if action["success"]) / len(recent_history)
            insights.append(f"📊 Recent success rate: {recent_success_rate:.1%}")
            
        return insights
        
    def optimize_batch_size(self, folder_count):
        """AI-optimized batch size based on performance data"""
        if folder_count < 50:
            return 5
        elif folder_count < 200:
            return 10
        elif folder_count < 1000:
            return 25
        else:
            return 50
            
    def predict_runtime(self, folder_count):
        """Predict ritual runtime based on historical data"""
        if not self.learning_data["success_history"]:
            return folder_count * 0.1  # Default estimate
            
        recent_actions = self.learning_data["success_history"][-50:]
        if len(recent_actions) < 10:
            return folder_count * 0.1
            
        # Calculate average time per folder from recent history
        total_time = 0
        total_folders = 0
        
        for i in range(1, len(recent_actions)):
            time_diff = recent_actions[i]["timestamp"] - recent_actions[i-1]["timestamp"]
            if time_diff < 60:  # Reasonable time difference
                total_time += time_diff
                total_folders += 1
                
        if total_folders > 0:
            avg_time_per_folder = total_time / total_folders
            return folder_count * avg_time_per_folder
        else:
            return folder_count * 0.1
            
    def smart_exclude_patterns(self):
        """AI-generated exclude patterns based on learning"""
        patterns = [".git", ".DS_Store", "__pycache__", ".vscode"]
        
        # Add patterns that consistently fail
        for pattern, data in self.learning_data["folder_patterns"].items():
            if data["total_attempts"] > 10 and data["success_rate"] < 0.2:
                patterns.append(f"*{pattern}*")
                
        return patterns
        
    def generate_recommendations(self):
        """Generate AI recommendations for Bobby ritual optimization"""
        recommendations = []
        
        # Analyze recent performance
        recent_history = self.learning_data["success_history"][-100:]
        if recent_history:
            error_patterns = defaultdict(int)
            for action in recent_history:
                if not action["success"]:
                    for pattern in action["analysis"]["name_pattern"]:
                        error_patterns[pattern] += 1
                        
            if error_patterns:
                most_problematic = max(error_patterns.items(), key=lambda x: x[1])
                recommendations.append(f"🔧 Consider excluding folders with pattern: {most_problematic[0]}")
                
        # Time-based recommendations
        if len(self.learning_data["success_history"]) > 50:
            timestamps = [action["timestamp"] for action in self.learning_data["success_history"]]
            time_gaps = [timestamps[i] - timestamps[i-1] for i in range(1, len(timestamps))]
            avg_gap = sum(time_gaps) / len(time_gaps)
            
            if avg_gap > 1.0:
                recommendations.append("⚡ Consider increasing batch size for better performance")
            elif avg_gap < 0.1:
                recommendations.append("🐌 Consider reducing batch size to prevent system overload")
                
        return recommendations

def main():
    """Demo of Bobby AI capabilities"""
    print("🧠 Bobby AI Agent - Intelligent Icon Management")
    print("=" * 50)
    
    ai = BobbyAI()
    
    # Generate insights
    insights = ai.generate_insights()
    if insights:
        print("\n🔍 AI Insights:")
        for insight in insights:
            print(f"  {insight}")
    else:
        print("\n🔍 No learning data available yet. Run some Bobby rituals to generate insights!")
        
    # Generate recommendations
    recommendations = ai.generate_recommendations()
    if recommendations:
        print("\n💡 AI Recommendations:")
        for rec in recommendations:
            print(f"  {rec}")
            
    # Show smart exclude patterns
    smart_patterns = ai.smart_exclude_patterns()
    print(f"\n🚫 Smart Exclude Patterns: {smart_patterns}")
    
    print("\n✨ Bobby AI is ready to learn from your icon rituals!")

if __name__ == "__main__":
    main()