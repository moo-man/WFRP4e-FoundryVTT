// Activate chat listeners defined in dice-wfrp4e.js
Hooks.on('renderChatLog', (log, html, data) => {
    DiceWFRP.chatListeners(html)
    
});