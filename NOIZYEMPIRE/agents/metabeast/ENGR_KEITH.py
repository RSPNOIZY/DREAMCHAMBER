#!/usr/bin/env python3
"""
🔧 ENGR_KEITH - TECHNICAL GENIUS & CODE ARCHITECT 🔧

The master engineer who builds, fixes, and optimizes everything.
Expert in system design, code architecture, and technical problem-solving.

Specialties:
- System architecture & design
- Code optimization & refactoring
- Performance tuning
- Infrastructure setup
- DevOps automation
- Technical troubleshooting

Author: ENGR_KEITH (Technical Genius of the AI Family)
Mission: Build perfect systems that work flawlessly
"""

import os
import sys
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import json
import re


class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'


class EngrKeith:
    """
    🔧 ENGR_KEITH - The Technical Genius
    
    Capabilities:
    - Code analysis and optimization
    - System health checks
    - Performance diagnostics
    - Dependency management
    - Build system optimization
    - Infrastructure automation
    """
    
    def __init__(self, workspace: str, verbose: bool = True):
        self.workspace = Path(workspace)
        self.verbose = verbose
        
        # Configuration
        self.config = {
            'python_version': None,
            'node_version': None,
            'git_available': False,
            'docker_available': False,
            'tools': {}
        }
        
        # Analysis results
        self.diagnostics = {
            'system_health': {},
            'code_quality': {},
            'dependencies': {},
            'performance': {},
            'issues': []
        }
        
        self.log("🔧 ENGR_KEITH initialized", "header")
        self.detect_environment()
    
    def log(self, message: str, level: str = "info"):
        """Technical logging"""
        if not self.verbose:
            return
        
        prefix = {
            "info": f"{Colors.CYAN}[INFO]",
            "success": f"{Colors.GREEN}[SUCCESS]",
            "warning": f"{Colors.YELLOW}[WARNING]",
            "error": f"{Colors.RED}[ERROR]",
            "header": f"{Colors.BOLD}{Colors.BLUE}[KEITH]"
        }.get(level, "[LOG]")
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"{prefix} {timestamp} {message}{Colors.END}")
    
    def run_command(self, cmd: List[str], capture: bool = True) -> Tuple[bool, str]:
        """Execute system command safely"""
        try:
            if capture:
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                return result.returncode == 0, result.stdout
            else:
                result = subprocess.run(cmd, timeout=30)
                return result.returncode == 0, ""
        except Exception as e:
            self.log(f"Command failed: {' '.join(cmd)} - {e}", "error")
            return False, str(e)
    
    def detect_environment(self):
        """Detect available tools and versions"""
        self.log("🔍 Detecting environment...", "info")
        
        # Check Python
        success, output = self.run_command(['python3', '--version'])
        if success:
            self.config['python_version'] = output.strip()
            self.log(f"Python: {self.config['python_version']}", "success")
        
        # Check Node.js
        success, output = self.run_command(['node', '--version'])
        if success:
            self.config['node_version'] = output.strip()
            self.log(f"Node.js: {self.config['node_version']}", "success")
        
        # Check Git
        success, _ = self.run_command(['git', '--version'])
        self.config['git_available'] = success
        if success:
            self.log("Git: Available", "success")
        
        # Check Docker
        success, _ = self.run_command(['docker', '--version'])
        self.config['docker_available'] = success
        if success:
            self.log("Docker: Available", "success")
        
        # Check code quality tools
        tools = {
            'black': ['black', '--version'],
            'isort': ['isort', '--version'],
            'pylint': ['pylint', '--version'],
            'pytest': ['pytest', '--version'],
            'npm': ['npm', '--version']
        }
        
        for tool_name, cmd in tools.items():
            success, output = self.run_command(cmd)
            self.config['tools'][tool_name] = success
            if success:
                self.log(f"{tool_name}: Available", "success")
    
    def analyze_python_project(self, project_path: Path) -> Dict:
        """Comprehensive Python project analysis"""
        self.log(f"🐍 Analyzing Python project: {project_path}", "header")
        
        analysis = {
            'files': [],
            'total_lines': 0,
            'imports': set(),
            'functions': [],
            'classes': [],
            'issues': []
        }
        
        # Find all Python files
        py_files = list(project_path.rglob('*.py'))
        self.log(f"Found {len(py_files)} Python files", "info")
        
        for py_file in py_files:
            file_analysis = self.analyze_python_file(py_file)
            analysis['files'].append(file_analysis)
            analysis['total_lines'] += file_analysis['lines']
            analysis['imports'].update(file_analysis['imports'])
            analysis['functions'].extend(file_analysis['functions'])
            analysis['classes'].extend(file_analysis['classes'])
            analysis['issues'].extend(file_analysis['issues'])
        
        # Check for requirements.txt
        req_file = project_path / 'requirements.txt'
        if req_file.exists():
            analysis['requirements'] = self.parse_requirements(req_file)
        else:
            self.log("No requirements.txt found", "warning")
            analysis['issues'].append("Missing requirements.txt")
        
        # Check for setup.py or pyproject.toml
        if not (project_path / 'setup.py').exists() and not (project_path / 'pyproject.toml').exists():
            self.log("No setup.py or pyproject.toml found", "warning")
            analysis['issues'].append("Missing package configuration")
        
        return analysis
    
    def analyze_python_file(self, file_path: Path) -> Dict:
        """Analyze individual Python file"""
        analysis = {
            'path': str(file_path),
            'lines': 0,
            'imports': [],
            'functions': [],
            'classes': [],
            'issues': []
        }
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.split('\n')
                analysis['lines'] = len(lines)
            
            # Check syntax
            try:
                compile(content, str(file_path), 'exec')
            except SyntaxError as e:
                analysis['issues'].append(f"Syntax error: {e}")
            
            # Find imports
            import_pattern = r'^(?:from\s+[\w.]+\s+)?import\s+([\w.,\s*]+)'
            for match in re.finditer(import_pattern, content, re.MULTILINE):
                analysis['imports'].append(match.group(0))
            
            # Find functions
            func_pattern = r'def\s+(\w+)\s*\('
            analysis['functions'] = re.findall(func_pattern, content)
            
            # Find classes
            class_pattern = r'class\s+(\w+)'
            analysis['classes'] = re.findall(class_pattern, content)
            
            # Check for common issues
            if 'eval(' in content:
                analysis['issues'].append("Security: Use of eval()")
            if 'exec(' in content:
                analysis['issues'].append("Security: Use of exec()")
            if 'import *' in content:
                analysis['issues'].append("Style: Wildcard import")
            
        except Exception as e:
            analysis['issues'].append(f"Analysis error: {e}")
        
        return analysis
    
    def parse_requirements(self, req_file: Path) -> List[str]:
        """Parse requirements.txt"""
        requirements = []
        
        try:
            with open(req_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        requirements.append(line)
        except Exception as e:
            self.log(f"Error parsing requirements: {e}", "error")
        
        return requirements
    
    def optimize_python_code(self, file_path: Path) -> bool:
        """Optimize Python code using available tools"""
        self.log(f"⚡ Optimizing: {file_path.name}", "info")
        
        success = True
        
        # Black formatting
        if self.config['tools'].get('black'):
            success, _ = self.run_command(['black', '--quiet', str(file_path)])
            if success:
                self.log(f"✓ Black formatting applied", "success")
        
        # isort imports
        if self.config['tools'].get('isort'):
            success, _ = self.run_command(['isort', '--quiet', str(file_path)])
            if success:
                self.log(f"✓ Import sorting applied", "success")
        
        return success
    
    def check_system_health(self) -> Dict:
        """Comprehensive system health check"""
        self.log("💊 Running system health check...", "header")
        
        health = {
            'disk_space': self.check_disk_space(),
            'memory': self.check_memory(),
            'cpu': self.check_cpu(),
            'processes': self.check_processes(),
            'network': self.check_network()
        }
        
        self.diagnostics['system_health'] = health
        return health
    
    def check_disk_space(self) -> Dict:
        """Check disk space"""
        try:
            result = subprocess.run(['df', '-h'], capture_output=True, text=True)
            lines = result.stdout.split('\n')[1:]  # Skip header
            
            disks = []
            for line in lines:
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 6:
                        disks.append({
                            'filesystem': parts[0],
                            'size': parts[1],
                            'used': parts[2],
                            'available': parts[3],
                            'usage': parts[4],
                            'mount': parts[8] if len(parts) > 8 else parts[5]
                        })
            
            return {'status': 'ok', 'disks': disks}
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def check_memory(self) -> Dict:
        """Check memory usage"""
        try:
            result = subprocess.run(['vm_stat'], capture_output=True, text=True)
            return {'status': 'ok', 'details': 'Available'}
        except:
            return {'status': 'unavailable'}
    
    def check_cpu(self) -> Dict:
        """Check CPU info"""
        try:
            result = subprocess.run(['sysctl', '-n', 'machdep.cpu.brand_string'], 
                                  capture_output=True, text=True)
            return {'status': 'ok', 'cpu': result.stdout.strip()}
        except:
            return {'status': 'unavailable'}
    
    def check_processes(self) -> Dict:
        """Check running processes"""
        try:
            result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
            lines = result.stdout.split('\n')
            return {'status': 'ok', 'count': len(lines) - 1}
        except:
            return {'status': 'unavailable'}
    
    def check_network(self) -> Dict:
        """Check network connectivity"""
        try:
            result = subprocess.run(['ping', '-c', '1', '8.8.8.8'], 
                                  capture_output=True, text=True, timeout=5)
            return {'status': 'ok' if result.returncode == 0 else 'offline'}
        except:
            return {'status': 'unavailable'}
    
    def generate_report(self) -> str:
        """Generate comprehensive technical report"""
        report = f"""
{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}
{Colors.BOLD}{Colors.BLUE}{'ENGR_KEITH TECHNICAL REPORT'.center(80)}{Colors.END}
{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}

{Colors.BOLD}🔧 ENVIRONMENT{Colors.END}
  Python: {self.config.get('python_version', 'Not available')}
  Node.js: {self.config.get('node_version', 'Not available')}
  Git: {'Available' if self.config['git_available'] else 'Not available'}
  Docker: {'Available' if self.config['docker_available'] else 'Not available'}

{Colors.BOLD}🛠️  TOOLS{Colors.END}
"""
        
        for tool, available in self.config['tools'].items():
            status = f"{Colors.GREEN}✓{Colors.END}" if available else f"{Colors.RED}✗{Colors.END}"
            report += f"  {status} {tool}\n"
        
        if self.diagnostics.get('system_health'):
            report += f"\n{Colors.BOLD}💊 SYSTEM HEALTH{Colors.END}\n"
            health = self.diagnostics['system_health']
            
            if health.get('disk_space', {}).get('disks'):
                report += "  Disk Space:\n"
                for disk in health['disk_space']['disks'][:5]:  # Show first 5
                    report += f"    {disk['mount']}: {disk['used']}/{disk['size']} ({disk['usage']})\n"
        
        report += f"\n{Colors.GREEN}{Colors.BOLD}✓ TECHNICAL ANALYSIS COMPLETE{Colors.END}\n"
        
        return report
    
    def save_report(self, output_path: Path):
        """Save report to file"""
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'engineer': 'ENGR_KEITH',
            'workspace': str(self.workspace),
            'configuration': self.config,
            'diagnostics': self.diagnostics
        }
        
        with open(output_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        self.log(f"Report saved: {output_path}", "success")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="🔧 ENGR_KEITH - Technical Genius & Code Architect"
    )
    parser.add_argument('workspace', type=str, help='Workspace to analyze')
    parser.add_argument('-o', '--output', type=str, help='Output report file')
    parser.add_argument('--health', action='store_true', help='Run system health check')
    parser.add_argument('--optimize', action='store_true', help='Optimize Python files')
    
    args = parser.parse_args()
    
    # Initialize ENGR_KEITH
    keith = EngrKeith(args.workspace)
    
    # Run health check if requested
    if args.health:
        keith.check_system_health()
    
    # Optimize code if requested
    if args.optimize:
        workspace_path = Path(args.workspace)
        for py_file in workspace_path.rglob('*.py'):
            keith.optimize_python_code(py_file)
    
    # Generate and print report
    print(keith.generate_report())
    
    # Save report if requested
    if args.output:
        keith.save_report(Path(args.output))


if __name__ == "__main__":
    main()
