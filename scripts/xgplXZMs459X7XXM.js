// Apply changes when the mask is worn

if (args.equipped) {  
  this.actor.createEmbeddedDocuments("ActiveEffect", [this.item.effects.contents[1]?.convertToApplied()])  
  this.script.message(`${this.actor.name} dons the <strong>${this.item.name}</strong>. <br>
        They suffer –20 to all attempts to resist Disease.<br>
        If they wear the mask for more than an hour or benefit from any of its effects, they are exposed to @Corruption[moderate]{Moderate Corruption}. 
        `,
      {whisper: ChatMessage.getWhisperRecipients("GM")}) 
}

// Notify of lingering effects when mask is removed
else if (!args.equipped)
{
    await this.item.effects.contents[0].delete();
    await this.item.update({name : this.item.name += " (Used)"})
    this.script.message(`<strong>${this.item.name}</strong> on ${this.actor.name} has been taken off and loses its properties. However, the effects last for [[1d10+4]] days, after which they should be manually removed.`, 
    {whisper: ChatMessage.getWhisperRecipients("GM")}
    )
    
}
