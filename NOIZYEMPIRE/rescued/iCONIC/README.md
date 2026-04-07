# Bobby Icon Ritualize

A comprehensive Python utility suite for macOS that includes advanced folder icon automation and media file management with AI-powered optimization.

## 🚀 Bobby Agent Suite

### 🎨 Bobby Dashboard Elite
- Modern GUI interface with real-time monitoring
- Visual statistics and progress tracking
- Advanced configuration management
- Live feed of operations

### 💻 Bobby Commander
- Advanced command-line interface
- Batch processing capabilities
- Progress bars and detailed logging
- Configuration wizard

### 🧠 Bobby AI Agent
- Machine learning insights and optimization
- Pattern recognition for folder types
- Performance analytics and recommendations
- Smart exclude pattern generation

### 🎬 Bobby Media Migrator
- Smart audio & video file management
- Multi-volume distribution capabilities
- **🙏 HAND OF GOD MODE** - Emergency evacuation to ANY available volume
- Volume analysis and space optimization

### 🎪 Bobby Master Control
- Unified control center for all agents
- System status monitoring
- Integrated mission control interface
- Combined statistics and reporting

## Features

- 🔍 Scans directories recursively
- 🛡️ Preserves existing custom icons
- 🧿 Applies Bobby icon to folders with default icons
- ⚠️ Error handling and validation
- 🚀 Simple configuration
- 🎬 Advanced media file migration
- 🙏 Emergency "Hand of God" mode for critical situations
- 🧠 AI-powered optimization and learning

## Prerequisites

### Required Tools

1. **fileicon** - Command-line tool for managing folder icons on macOS
   ```bash
   brew install fileicon
   ```

2. **Python 3.6+** - The script is written in Python 3

### Bobby Icon File

You'll need your Bobby icon image file (PNG format recommended) saved somewhere accessible on your system.

## Installation

1. Clone or download this repository
2. Update the configuration in `bobby_icon_ritualize.py`:
   - `BOBBY_ICON_PATH`: Path to your Bobby icon image
   - `TARGET_ROOT`: Root directory to scan for folders

## Configuration

Edit the configuration section in `bobby_icon_ritualize.py`:

```python
# 🔧 CONFIGURATION
BOBBY_ICON_PATH = "/Users/rob/Desktop/bobby_bg.png"  # Update this path
TARGET_ROOT = "/Users/rob/Documents"  # Folder to scan
```

## Usage

Run the script from the terminal:

```bash
python3 bobby_icon_ritualize.py
```

Or make it executable:

```bash
chmod +x bobby_icon_ritualize.py
./bobby_icon_ritualize.py
```

## How It Works

1. **Scan**: The script walks through all subdirectories of `TARGET_ROOT`
2. **Check**: For each folder, it checks if a custom icon already exists (looks for `Icon\r` file)
3. **Apply**: If no custom icon exists, it applies the Bobby icon using the `fileicon` command
4. **Preserve**: If a custom icon already exists, it leaves it unchanged

## Output

The script provides clear feedback:
- ✅ Icon applied successfully
- 🛡️ Custom icon preserved (skipped)
- ⚠️ Failed to apply icon
- ❌ Missing dependencies or files

## Safety Features

- Validates that the Bobby icon file exists before starting
- Validates that the target directory exists
- Preserves existing custom icons
- Provides clear error messages
- Safe operation - only adds icons, never removes them

## Troubleshooting

### "fileicon command not found"
Install fileicon using Homebrew:
```bash
brew install fileicon
```

### "Bobby icon not found"
Check that the `BOBBY_ICON_PATH` points to a valid image file.

### "Target directory not found"
Verify that the `TARGET_ROOT` directory exists and is accessible.

## License

This project is open source and available under the MIT License.