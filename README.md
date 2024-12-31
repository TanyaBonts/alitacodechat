# ELITEA Code Chat

ELITEA Code Chat for VSCode is an auxiliary GUI for ELITEA Code, you can utilize the functionality of ELITEA Code and you can also chat with ELITEA.

# Pre-requisite
ELITEA Code Chat depends on ELITEA Code for VSCode. It can be installed through vs code's extension market: https://marketplace.visualstudio.com/items?itemName=ProjectAlita.alitacode



# Features list:

- Chat with ELITEA directly. It will use the model settings set by ELITEA Code extension.
- Type trigger char to add participants to chat: "/" for prompt, "#" for datasources or "@" for agent.


## Initialize

`npm install`

## Generate Extension Package
Run following to generate the `.vsix ` package. Then you can publish it or install it manually in vs code extension by clicking the 3 dots in "Extension" and then "Install from VSIX..."

`npm run vsce`

## Development
Run following and VS Code's "Run" >> "Start Debugging" to debug extension with auto rebuild.

`npm run build-watch`

Type `Command + P` in VS code and then `>Developer: Open Webview Developer Tools` to open the ui debug tool just like the Chrome browser debug tool.

