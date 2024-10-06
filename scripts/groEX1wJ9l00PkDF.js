let turns = this.effect.getFlag("wfrp4e", "turns");
if (turns <= 0) return;
turns--;

const speaker = ChatMessage.getSpeaker({actor: this.actor});
const targetId = this.effect.getFlag("wfrp4e", "target");
const target = canvas.scene.tokens.get(targetId);

if (turns > 0) {
  this.effect.setFlag("wfrp4e", "turns", turns);

  return this.script.message(`<p><b>${speaker.alias}</b> continues wrapping itself around <b>${target.name}</b>. It will be able to start crushin in ${turns} turns.</p>`);
}

if (this.actor.items.find(i => i.type === "extendedTest" && i.name === this.effect.name)) {
  this.script.message(`<p><b>${speaker.alias}</b> can resume crushing <b>${target.name}</b> with the Extended Test.</p>`);

  return;
}

const extendedTestData = {
  name: this.effect.name,
  type: "extendedTest",
  img: this.effect.img,
  system: {
    SL: {
      current: 0,
      target: target.actor.system.status.wounds.value
    },
    test: {
      value: 'Strength'
    },
    completion: {
      value: "remove"
    },
    difficulty: {
      value: "challenging"
    }
  }
};

const extendedTests = await this.actor.createEmbeddedDocuments("Item", [extendedTestData], {fromEffect: this.effect.id});
const extendedTest = extendedTests[0];

this.script.message(`<p><b>${speaker.alias}</b> finished wrapping itself around <b>${target.name}</b>. It can now begin crushing via the @UUID[${extendedTest.uuid}] Extended Test.</p>`);

let effect = {
  name: extendedTest.name,
  img: extendedTest.img,
  system: {
    transferData : {
        type: "document",
        documentType: "Item"
      },
      scriptData: [
        {
          label: extendedTest.name,
          script: `
              let id = this.item.flags.wfrp4e.fromEffect;
              let effect = this.actor.effects.find(e => e.id === id);
              const speaker = ChatMessage.getSpeaker({actor: this.actor});
              const targetId = effect.getFlag("wfrp4e", "target");
              const target = canvas.scene.tokens.get(targetId);
              this.script.message(\`<p><b>${speaker.alias}</b> crushed the <b>${target.name}</b>. Boat shatters, reduced to a mass of flotsam.</p>\`);
              await effect.delete();
                          `,
          trigger: "deleteEffect"
        }
      ]
  }
}

await extendedTests[0].createEmbeddedDocuments("ActiveEffect", [effect]);