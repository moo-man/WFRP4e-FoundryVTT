if (args.test.result.critical && args.test.result.roll % 10 == 0) 
{
    game.wfrp4e.tables.findTable("knuckleduster-diseases").roll().then(roll => {
      let results = roll.results[0]

      this.script.message(`<strong>${this.actor.name}</strong> contracts @UUID[Compendium.${results.documentCollection}.${results.documentId}]{${results.text}}`, {blind : true, whisper: ChatMessage.getWhisperRecipients("GM") })
    })

  }

