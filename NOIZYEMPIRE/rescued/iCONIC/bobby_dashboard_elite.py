#!/usr/bin/env python3
"""
🚀 Bobby Dashboard Elite - Advanced Icon Management System
A sophisticated macOS utility with GUI dashboard for Bobby icon automation.

Features:
- 🎨 Modern GUI Dashboard
- 📊 Real-time Statistics
- 🔄 Batch Processing
- 📋 Detailed Logging
- ⚙️ Advanced Configuration
- 🎯 Smart Filtering
"""

import os
import sys
import json
import time
import threading
from datetime import datetime
from pathlib import Path
import subprocess
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext

class BobbyDashboard:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🚀 Bobby Dashboard Elite")
        self.root.geometry("1200x800")
        self.root.configure(bg="#1a1a1a")
        
        # Configuration
        self.config = {
            "bobby_icon_path": "/Users/rob/Desktop/bobby_bg.png",
            "target_root": "/Users/rob/Documents",
            "icon_file_name": "Icon\r",
            "auto_backup": True,
            "verbose_logging": True,
            "exclude_patterns": [".git", ".DS_Store", "__pycache__"]
        }
        
        # Statistics
        self.stats = {
            "total_folders": 0,
            "icons_applied": 0,
            "icons_preserved": 0,
            "errors": 0,
            "start_time": None
        }
        
        self.is_scanning = False
        self.log_messages = []
        
        self.setup_ui()
        self.load_config()
        
    def setup_ui(self):
        """Create the advanced dashboard UI"""
        # Create main frame
        main_frame = tk.Frame(self.root, bg="#1a1a1a")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Title
        title = tk.Label(main_frame, text="🚀 Bobby Dashboard Elite", 
                        font=("Arial", 24, "bold"), fg="#00ff88", bg="#1a1a1a")
        title.pack(pady=(0, 20))
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Setup tabs
        self.setup_dashboard_tab()
        self.setup_config_tab()
        self.setup_logs_tab()
        self.setup_stats_tab()
        
    def setup_dashboard_tab(self):
        """Main dashboard tab"""
        dashboard_frame = tk.Frame(self.notebook, bg="#2a2a2a")
        self.notebook.add(dashboard_frame, text="🎯 Dashboard")
        
        # Control Panel
        control_frame = tk.LabelFrame(dashboard_frame, text="🎮 Control Panel", 
                                    fg="#00ff88", bg="#2a2a2a", font=("Arial", 12, "bold"))
        control_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Buttons
        btn_frame = tk.Frame(control_frame, bg="#2a2a2a")
        btn_frame.pack(pady=10)
        
        self.scan_btn = tk.Button(btn_frame, text="🔍 Start Bobby Ritual", 
                                command=self.start_ritual, bg="#00ff88", fg="black",
                                font=("Arial", 12, "bold"), width=20)
        self.scan_btn.pack(side=tk.LEFT, padx=5)
        
        self.stop_btn = tk.Button(btn_frame, text="⏹ Stop", 
                                command=self.stop_ritual, bg="#ff4444", fg="white",
                                font=("Arial", 12, "bold"), width=15, state=tk.DISABLED)
        self.stop_btn.pack(side=tk.LEFT, padx=5)
        
        self.preview_btn = tk.Button(btn_frame, text="👁 Preview Mode", 
                                   command=self.preview_mode, bg="#4488ff", fg="white",
                                   font=("Arial", 12, "bold"), width=15)
        self.preview_btn.pack(side=tk.LEFT, padx=5)
        
        # Progress
        progress_frame = tk.Frame(control_frame, bg="#2a2a2a")
        progress_frame.pack(fill=tk.X, pady=10)
        
        tk.Label(progress_frame, text="Progress:", fg="white", bg="#2a2a2a").pack(anchor=tk.W)
        self.progress = ttk.Progressbar(progress_frame, mode='indeterminate')
        self.progress.pack(fill=tk.X, pady=5)
        
        self.status_label = tk.Label(progress_frame, text="Ready for Bobby magic! ✨", 
                                   fg="#00ff88", bg="#2a2a2a")
        self.status_label.pack(anchor=tk.W)
        
        # Live Feed
        feed_frame = tk.LabelFrame(dashboard_frame, text="📡 Live Feed", 
                                 fg="#00ff88", bg="#2a2a2a", font=("Arial", 12, "bold"))
        feed_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.live_feed = scrolledtext.ScrolledText(feed_frame, bg="#1a1a1a", fg="#00ff88",
                                                  font=("Courier", 10), height=15)
        self.live_feed.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
    def setup_config_tab(self):
        """Configuration tab"""
        config_frame = tk.Frame(self.notebook, bg="#2a2a2a")
        self.notebook.add(config_frame, text="⚙️ Config")
        
        # Bobby Icon Path
        icon_frame = tk.LabelFrame(config_frame, text="🎨 Bobby Icon Settings", 
                                 fg="#00ff88", bg="#2a2a2a")
        icon_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(icon_frame, text="Bobby Icon Path:", fg="white", bg="#2a2a2a").pack(anchor=tk.W)
        icon_path_frame = tk.Frame(icon_frame, bg="#2a2a2a")
        icon_path_frame.pack(fill=tk.X, pady=5)
        
        self.icon_path_var = tk.StringVar(value=self.config["bobby_icon_path"])
        self.icon_path_entry = tk.Entry(icon_path_frame, textvariable=self.icon_path_var, 
                                       bg="#1a1a1a", fg="white", width=50)
        self.icon_path_entry.pack(side=tk.LEFT, padx=(0, 5))
        
        tk.Button(icon_path_frame, text="Browse", command=self.browse_icon,
                 bg="#4488ff", fg="white").pack(side=tk.LEFT)
        
        # Target Directory
        target_frame = tk.LabelFrame(config_frame, text="🎯 Target Directory", 
                                   fg="#00ff88", bg="#2a2a2a")
        target_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(target_frame, text="Scan Directory:", fg="white", bg="#2a2a2a").pack(anchor=tk.W)
        target_path_frame = tk.Frame(target_frame, bg="#2a2a2a")
        target_path_frame.pack(fill=tk.X, pady=5)
        
        self.target_path_var = tk.StringVar(value=self.config["target_root"])
        self.target_path_entry = tk.Entry(target_path_frame, textvariable=self.target_path_var,
                                         bg="#1a1a1a", fg="white", width=50)
        self.target_path_entry.pack(side=tk.LEFT, padx=(0, 5))
        
        tk.Button(target_path_frame, text="Browse", command=self.browse_target,
                 bg="#4488ff", fg="white").pack(side=tk.LEFT)
        
        # Advanced Options
        advanced_frame = tk.LabelFrame(config_frame, text="🔧 Advanced Options", 
                                     fg="#00ff88", bg="#2a2a2a")
        advanced_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.auto_backup_var = tk.BooleanVar(value=self.config["auto_backup"])
        tk.Checkbutton(advanced_frame, text="Auto Backup", variable=self.auto_backup_var,
                      fg="white", bg="#2a2a2a", selectcolor="#1a1a1a").pack(anchor=tk.W)
        
        self.verbose_var = tk.BooleanVar(value=self.config["verbose_logging"])
        tk.Checkbutton(advanced_frame, text="Verbose Logging", variable=self.verbose_var,
                      fg="white", bg="#2a2a2a", selectcolor="#1a1a1a").pack(anchor=tk.W)
        
        # Save Config Button
        tk.Button(config_frame, text="💾 Save Configuration", command=self.save_config,
                 bg="#00ff88", fg="black", font=("Arial", 12, "bold")).pack(pady=20)
        
    def setup_logs_tab(self):
        """Logs tab"""
        logs_frame = tk.Frame(self.notebook, bg="#2a2a2a")
        self.notebook.add(logs_frame, text="📋 Logs")
        
        # Log controls
        controls_frame = tk.Frame(logs_frame, bg="#2a2a2a")
        controls_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Button(controls_frame, text="🗑 Clear Logs", command=self.clear_logs,
                 bg="#ff4444", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(controls_frame, text="💾 Export Logs", command=self.export_logs,
                 bg="#4488ff", fg="white").pack(side=tk.LEFT, padx=5)
        
        # Logs display
        self.logs_text = scrolledtext.ScrolledText(logs_frame, bg="#1a1a1a", fg="#ffffff",
                                                  font=("Courier", 9))
        self.logs_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
    def setup_stats_tab(self):
        """Statistics tab"""
        stats_frame = tk.Frame(self.notebook, bg="#2a2a2a")
        self.notebook.add(stats_frame, text="📊 Stats")
        
        # Stats display
        stats_main = tk.Frame(stats_frame, bg="#2a2a2a")
        stats_main.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Create stat cards
        self.create_stat_card(stats_main, "Total Folders", "total_folders", 0, 0)
        self.create_stat_card(stats_main, "Icons Applied", "icons_applied", 0, 1)
        self.create_stat_card(stats_main, "Icons Preserved", "icons_preserved", 1, 0)
        self.create_stat_card(stats_main, "Errors", "errors", 1, 1)
        
        # Runtime info
        runtime_frame = tk.LabelFrame(stats_main, text="⏱ Runtime Info", 
                                    fg="#00ff88", bg="#2a2a2a")
        runtime_frame.grid(row=2, column=0, columnspan=2, sticky="ew", pady=20)
        
        self.runtime_label = tk.Label(runtime_frame, text="Runtime: Not started", 
                                    fg="white", bg="#2a2a2a", font=("Arial", 12))
        self.runtime_label.pack(pady=10)
        
        stats_main.grid_columnconfigure(0, weight=1)
        stats_main.grid_columnconfigure(1, weight=1)
        
    def create_stat_card(self, parent, title, key, row, col):
        """Create a statistics card"""
        card = tk.LabelFrame(parent, text=title, fg="#00ff88", bg="#2a2a2a",
                           font=("Arial", 12, "bold"))
        card.grid(row=row, column=col, sticky="ew", padx=10, pady=10)
        
        value_label = tk.Label(card, text="0", fg="#ffffff", bg="#2a2a2a",
                             font=("Arial", 24, "bold"))
        value_label.pack(pady=20)
        
        setattr(self, f"{key}_label", value_label)
        
    def log_message(self, message, level="INFO"):
        """Add message to logs"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}"
        self.log_messages.append(log_entry)
        
        # Update live feed
        self.live_feed.insert(tk.END, log_entry + "\n")
        self.live_feed.see(tk.END)
        
        # Update logs tab
        self.logs_text.insert(tk.END, log_entry + "\n")
        self.logs_text.see(tk.END)
        
        # Color coding for different levels
        if level == "ERROR":
            self.live_feed.tag_add("error", "end-2l", "end-1l")
            self.live_feed.tag_config("error", foreground="#ff4444")
        elif level == "SUCCESS":
            self.live_feed.tag_add("success", "end-2l", "end-1l")
            self.live_feed.tag_config("success", foreground="#00ff88")
            
    def update_stats(self):
        """Update statistics display"""
        self.total_folders_label.config(text=str(self.stats["total_folders"]))
        self.icons_applied_label.config(text=str(self.stats["icons_applied"]))
        self.icons_preserved_label.config(text=str(self.stats["icons_preserved"]))
        self.errors_label.config(text=str(self.stats["errors"]))
        
        if self.stats["start_time"]:
            runtime = time.time() - self.stats["start_time"]
            self.runtime_label.config(text=f"Runtime: {runtime:.1f}s")
            
    def has_custom_icon(self, folder_path):
        """Check if folder has custom icon"""
        icon_file = Path(folder_path) / self.config["icon_file_name"]
        return icon_file.exists()
        
    def apply_icon(self, folder_path, preview=False):
        """Apply Bobby icon to folder"""
        if preview:
            self.log_message(f"PREVIEW: Would apply icon to {folder_path}", "INFO")
            return True
            
        try:
            subprocess.run([
                "fileicon", "set", folder_path, self.config["bobby_icon_path"]
            ], check=True, capture_output=True)
            self.log_message(f"Icon applied to: {folder_path}", "SUCCESS")
            self.stats["icons_applied"] += 1
            return True
        except subprocess.CalledProcessError as e:
            self.log_message(f"Failed to apply icon to: {folder_path}", "ERROR")
            self.stats["errors"] += 1
            return False
        except FileNotFoundError:
            self.log_message("fileicon command not found. Install with: brew install fileicon", "ERROR")
            self.stats["errors"] += 1
            return False
            
    def ritualize_folders_thread(self, preview=False):
        """Main folder processing thread"""
        self.stats["start_time"] = time.time()
        self.stats["total_folders"] = 0
        self.stats["icons_applied"] = 0
        self.stats["icons_preserved"] = 0
        self.stats["errors"] = 0
        
        # Validation
        if not Path(self.config["bobby_icon_path"]).exists():
            self.log_message(f"Bobby icon not found: {self.config['bobby_icon_path']}", "ERROR")
            self.finish_ritual()
            return
            
        if not Path(self.config["target_root"]).exists():
            self.log_message(f"Target directory not found: {self.config['target_root']}", "ERROR")
            self.finish_ritual()
            return
            
        self.log_message(f"Starting Bobby ritual in {'PREVIEW' if preview else 'LIVE'} mode...", "INFO")
        
        try:
            for root, dirs, _ in os.walk(self.config["target_root"]):
                if not self.is_scanning:
                    break
                    
                # Filter out excluded patterns
                dirs[:] = [d for d in dirs if not any(pattern in d for pattern in self.config["exclude_patterns"])]
                
                for folder in dirs:
                    if not self.is_scanning:
                        break
                        
                    folder_path = os.path.join(root, folder)
                    self.stats["total_folders"] += 1
                    
                    if not self.has_custom_icon(folder_path):
                        self.apply_icon(folder_path, preview)
                    else:
                        self.log_message(f"Custom icon preserved: {folder_path}", "INFO")
                        self.stats["icons_preserved"] += 1
                        
                    self.update_stats()
                    time.sleep(0.1)  # Small delay for UI updates
                    
        except Exception as e:
            self.log_message(f"Unexpected error: {str(e)}", "ERROR")
            
        self.finish_ritual()
        
    def start_ritual(self):
        """Start the Bobby ritual"""
        self.is_scanning = True
        self.scan_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.progress.start()
        self.status_label.config(text="Bobby is working his magic... ✨")
        
        # Start processing in separate thread
        thread = threading.Thread(target=self.ritualize_folders_thread)
        thread.daemon = True
        thread.start()
        
    def preview_mode(self):
        """Start preview mode"""
        self.is_scanning = True
        self.preview_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.progress.start()
        self.status_label.config(text="Preview mode active - no changes made 👁")
        
        # Start preview in separate thread
        thread = threading.Thread(target=self.ritualize_folders_thread, args=(True,))
        thread.daemon = True
        thread.start()
        
    def stop_ritual(self):
        """Stop the ritual"""
        self.is_scanning = False
        self.finish_ritual()
        
    def finish_ritual(self):
        """Clean up after ritual"""
        self.is_scanning = False
        self.scan_btn.config(state=tk.NORMAL)
        self.preview_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.progress.stop()
        self.status_label.config(text="Ritual complete! 🌟")
        
        # Final stats update
        self.update_stats()
        self.log_message("Bobby ritual completed!", "SUCCESS")
        
    def browse_icon(self):
        """Browse for Bobby icon file"""
        filename = filedialog.askopenfilename(
            title="Select Bobby Icon",
            filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp *.ico")]
        )
        if filename:
            self.icon_path_var.set(filename)
            
    def browse_target(self):
        """Browse for target directory"""
        dirname = filedialog.askdirectory(title="Select Target Directory")
        if dirname:
            self.target_path_var.set(dirname)
            
    def save_config(self):
        """Save configuration"""
        self.config["bobby_icon_path"] = self.icon_path_var.get()
        self.config["target_root"] = self.target_path_var.get()
        self.config["auto_backup"] = self.auto_backup_var.get()
        self.config["verbose_logging"] = self.verbose_var.get()
        
        # Save to file
        config_path = Path("bobby_config.json")
        with open(config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
            
        messagebox.showinfo("Configuration", "Configuration saved successfully!")
        self.log_message("Configuration saved", "SUCCESS")
        
    def load_config(self):
        """Load configuration from file"""
        config_path = Path("bobby_config.json")
        if config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    saved_config = json.load(f)
                    self.config.update(saved_config)
                self.log_message("Configuration loaded", "SUCCESS")
            except Exception as e:
                self.log_message(f"Failed to load config: {e}", "ERROR")
                
    def clear_logs(self):
        """Clear all logs"""
        self.live_feed.delete(1.0, tk.END)
        self.logs_text.delete(1.0, tk.END)
        self.log_messages.clear()
        
    def export_logs(self):
        """Export logs to file"""
        filename = filedialog.asksaveasfilename(
            title="Export Logs",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt")]
        )
        if filename:
            with open(filename, 'w') as f:
                f.write("\n".join(self.log_messages))
            messagebox.showinfo("Export", "Logs exported successfully!")
            
    def run(self):
        """Start the dashboard"""
        self.log_message("Bobby Dashboard Elite initialized! 🚀", "SUCCESS")
        self.root.mainloop()

def main():
    """Main entry point"""
    print("🚀 Launching Bobby Dashboard Elite...")
    
    # Check dependencies
    try:
        subprocess.run(["fileicon", "--help"], capture_output=True, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("❌ fileicon not found. Install with: brew install fileicon")
        return
        
    # Launch dashboard
    dashboard = BobbyDashboard()
    dashboard.run()

if __name__ == "__main__":
    main()