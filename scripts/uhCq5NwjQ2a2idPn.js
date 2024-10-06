const repaired_message = `<p>Finished repairing <em>${this.item.name}</em>.</p>`;
const test = 'Trade (Tailor)';
const difficulty = 'easy';
const target = 30;

const extendedTestData = {
  name: this.item.name,
  type: "extendedTest",
  img: this.item.img,
  system: {
    SL: {
      current: 0,
      target: target
    },
    test: {
      value: test
    },
    completion: {
      value: "remove"
    },
    difficulty: {
      value: difficulty
    }
  },
  effects: [
    {
      name: `Repair the ${this.item.name}`,
      img: this.item.img,
      system: {
        transferData : {
            type: "document",
            documentType: "Item"
          },
          scriptData: [
            {
              label: this.item.name,
              script: `
              let id = this.item.flags.wfrp4e.fromEffect;
              let effect = this.actor.appliedEffects.find(e => e.id === id);
              this.script.message("${repaired_message}");
              await effect.item.delete();
            `,
              trigger: "deleteEffect"
            }
          ]
        
      }
      }
  ]
};

await this.actor.createEmbeddedDocuments("Item", [extendedTestData], {fromEffect: this.effect.id});
