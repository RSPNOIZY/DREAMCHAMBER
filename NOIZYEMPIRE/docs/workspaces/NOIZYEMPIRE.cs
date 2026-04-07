{
  "folders": [
    {
      "name": "🎯 NOIZYLAB Main",
      "path": "."
    },
    {
      "name": "🎤 DreamChamber",
      "path": "./dreamchamber"
    },
    {
      "name": "🎙️ DreamChamber Extension",
      "path": "./dreamchamber-extension"
    },
    {
      "name": "🗣️ NOIZY Voice",
      "path": "./noizy-voice"
    },
    {
      "name": "🤖 Rob AVA API",
      "path": "./rob_ava"
    },
    {
      "name": "🏭 NOIZY Platform",
      "path": "./noizy_platform"
    },
    {
      "name": "🎬 RSP001 Pipeline",
      "path": "./rsp001_pipeline"
    }
  ],
  "settings": {
    "terminal.integrated.defaultProfile.osx": "zsh",
    "editor.formatOnSave": true,
    "typescript.updateImportsOnFileMove.enabled": "always",
    "files.exclude": {
      "**/node_modules": true,
      "**/__pycache__": true,
      "**/*.pyc": true,
      "**/out": false,
      "**/.DS_Store": true
    },
    "python.defaultInterpreterPath": "/usr/bin/python3",
    "eslint.workingDirectories": [
      {
        "directory": "dreamchamber",
        "changeProcessCWD": true
      },
      {
        "directory": "dreamchamber-extension",
        "changeProcessCWD": true
      },
      {
        "directory": "noizy-voice",
        "changeProcessCWD": true
      }
    ]
  },
  "launch": {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "🎤 Run DreamChamber Extension",
        "type": "extensionHost",
        "request": "launch",
        "runtimeExecutable": "${execPath}",
        "args": [
          "--extensionDevelopmentPath=${workspaceFolder}/dreamchamber"
        ]
      },
      {
        "name": "🎙️ Run DreamChamber-Extension",
        "type": "extensionHost",
        "request": "launch",
        "runtimeExecutable": "${execPath}",
        "args": [
          "--extensionDevelopmentPath=${workspaceFolder}/dreamchamber-extension"
        ]
      },
      {
        "name": "🗣️ Run NOIZY Voice Extension",
        "type": "extensionHost",
        "request": "launch",
        "runtimeExecutable": "${execPath}",
        "args": [
          "--extensionDevelopmentPath=${workspaceFolder}/noizy-voice"
        ]
      },
      {
        "name": "🤖 Debug Rob AVA API",
        "type": "debugpy",
        "request": "launch",
        "module": "uvicorn",
        "args": [
          "rob_ava.server:app",
          "--reload",
          "--port",
          "8091"
        ],
        "jinja": true,
        "cwd": "${workspaceFolder}"
      },
      {
        "name": "🏭 Debug NOIZY Platform API",
        "type": "debugpy",
        "request": "launch",
        "module": "uvicorn",
        "args": [
          "app.main:app",
          "--reload",
          "--port",
          "8090"
        ],
        "jinja": true,
        "cwd": "${workspaceFolder}/noizy_platform"
      }
    ],
    "compounds": []
  },
  "tasks": {
    "version": "2.0.0",
    "tasks": [
      {
        "label": "🔨 Build All Extensions",
        "dependsOn": [
          "Build DreamChamber",
          "Build DreamChamber-Extension",
          "Build NOIZY Voice"
        ]
      },
      {
        "label": "Build DreamChamber",
        "type": "npm",
        "script": "compile",
        "path": "dreamchamber",
        "problemMatcher": "$tsc",
        "group": "build"
      },
      {
        "label": "Build DreamChamber-Extension",
        "type": "npm",
        "script": "compile",
        "path": "dreamchamber-extension",
        "problemMatcher": "$tsc",
        "group": "build"
      },
      {
        "label": "Build NOIZY Voice",
        "type": "npm",
        "script": "compile",
        "path": "noizy-voice",
        "problemMatcher": "$tsc",
        "group": "build"
      },
      {
        "label": "🚀 Start Rob AVA Server",
        "type": "shell",
        "command": "uvicorn rob_ava.server:app --reload --port 8091",
        "options": {
          "cwd": "${workspaceFolder}"
        },
        "isBackground": true,
        "problemMatcher": {
          "pattern": {
            "regexp": "^$"
          },
          "background": {
            "activeOnStart": true,
            "beginsPattern": "^.*Application startup complete.*$",
            "endsPattern": "^.*$"
          }
        }
      },
      {
        "label": "🏭 Start Platform API",
        "type": "shell",
        "command": "cd noizy_platform && uvicorn app.main:app --reload --port 8090",
        "options": {
          "cwd": "${workspaceFolder}"
        },
        "isBackground": true,
        "problemMatcher": {
          "pattern": {
            "regexp": "^$"
          },
          "background": {
            "activeOnStart": true,
            "beginsPattern": "^.*Application startup complete.*$",
            "endsPattern": "^.*$"
          }
        }
      }
    ]
  }
}