let ingredients = this.actor.itemTypes.trapping.filter(i => i.system.trappingType.value == "ingredient");

if (ingredients.length == 0)
{
  return this.script.notification("No Ingredients!");
}
this.script.notification("Affected " + ingredients.map(i => i.name).join(", "));

for(let i of ingredients)
{
  i.update({
    name: i.setSpecifier("Tainted"),
    effects: [{
      name: "Tainted",
      img: i.img,
      system: {
        transferData :{
          documentType: "Item"
        },
        scriptData: [
          {
            label: "Malignant Influence",
            script: "args.fields.malignantInfluence = true;",
            trigger: "dialog",
            options: {
              activateScript: "return true;"
            }
          }
        ]
      }
    }]         
  });
}