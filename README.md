# key-util README

Utility tool for keybindings.json

## Features

- Sort: `key-util.sort`
- Apply Alias: `key-util.applyAlias`
- Apply All Aliases in config: `key-util.applyAllAliases`

## Alias

If you set `key-util.aliases` in settings to `["alt=cmd"]`. then run `key-util.applyAllAliases`.

Before:

```json
[
    {
        "key": "ctrl+cmd+g",
        "command": "editor.action.revealDefinition",
    }
]
```

After:
```json
[
    {
        "key": "ctrl+cmd+g",
        "command": "editor.action.revealDefinition",
    },
    {
        "key": "ctrl+alt+g",
        "command": "editor.action.revealDefinition",
    }
]
```
