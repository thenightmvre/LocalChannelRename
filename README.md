# Local Channel Rename

A BetterDiscord plugin that allows you to locally rename Discord channels for a personalized experience.

## ✨ Features

- **Persistent Renaming**: Rename channels locally - changes persist across Discord restarts
- **Settings Panel**: Easy-to-use settings interface to manage all your channel renames
- **Real-time Updates**: Channel names update immediately when added/modified
- **Safe & Local**: All changes are stored locally and don't affect the actual Discord servers

## 📦 Installation

1. Download `LocalChannelRename.plugin.js` from the [Releases](https://github.com/thenightmvre/LocalChannelRename/releases/tag/DiscordPlugin) page
2. Place the file in your BetterDiscord plugins folder:
   - Windows: `%APPDATA%\BetterDiscord\plugins\`
   - macOS: `~/Library/Application Support/BetterDiscord/plugins/`
   - Linux: `~/.config/BetterDiscord/plugins/`
3. Restart Discord or reload BetterDiscord (Ctrl+R)
4. Enable the plugin in BetterDiscord settings

## 🚀 Usage

### Adding Channel Renames

1. Open BetterDiscord Settings (Ctrl+,)
2. Navigate to Plugins → LocalChannelRename
3. Click the settings button next to the plugin
4. In the "Add New Rename" section:
   - Enter the Channel ID (right-click channel → Copy ID)
   - Enter your desired custom name
   - Click "Add Rename"

### Managing Renames

- **View Current Renames**: See all your configured renames in the settings panel
- **Remove Renames**: Click the "Remove" button next to any rename to delete it
- **Edit Renames**: Remove the old one and add a new one with the updated name

### Finding Channel IDs

To get a channel's ID:
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on any channel
3. Select "Copy ID"

## 🔧 How It Works

The plugin uses DOM manipulation to change how channel names are displayed in your Discord client. The actual channel names on Discord servers remain unchanged - this is purely a local visual modification.

## 🛠️ Technical Details

- **DOM-Based**: Uses MutationObserver to watch for channel list changes
- **Persistent Storage**: Saves renames using BetterDiscord's Data API
- **Real-time**: Updates channel names immediately when changes are made
- **Safe**: No modifications to Discord's actual data or API calls

## 📋 Requirements

- **Discord**: Stable version
- **BetterDiscord**: Version 1.0.0 or higher
- **Permissions**: Read/Write access to BetterDiscord plugins folder

## 🐛 Troubleshooting

### Plugin Not Loading
- Ensure the file is named exactly `LocalChannelRename.plugin.js`
- Check that BetterDiscord is properly installed and running
- Try restarting Discord completely

### Channel Names Not Updating
- Make sure you're using the correct Channel ID
- Try refreshing the channel list (switch channels or servers)
- Check the console for any error messages

### Settings Not Saving
- Ensure BetterDiscord has proper file system permissions
- Try disabling and re-enabling the plugin

## 📄 Compatibility

### Discord Info
```
stable 438971 (71f6d2c)
Host 1.0.9205 x64 (68268)
Build Override: N/A
Windows 10 64-bit (10.0.19045)
```

### BetterDiscord
```
stable 1.12.7
```

### Tested Environments
- Windows 10/11
- Discord Stable channel
- BetterDiscord stable releases

## 👥 Authors & Credits

**LocalChannelRename** was collaboratively created by:

- **Kilo Code** - Plugin development and BetterDiscord integration
- **Grok (xAI)** - AI assistance and code optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Disclaimer

This plugin is not affiliated with Discord Inc. or BetterDiscord. Use at your own risk. The plugin modifies the Discord client interface locally and does not violate Discord's Terms of Service as it doesn't interact with Discord's servers or APIs.

## 📊 Version History

### v1.4.0
- Complete rewrite with settings panel
- Improved channel detection algorithms
- Better error handling
- Enhanced logging for debugging

### v1.0.0
- Initial release
- Basic channel renaming functionality
