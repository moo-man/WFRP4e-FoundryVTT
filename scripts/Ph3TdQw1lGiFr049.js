    if (!args.test.context.phantasmal && 
      (this.actor.isOpposing || args.test.context.defending) && 
      args.test.result.roll % 11 == 0 && 
      args.test.succeeded && 
      ["Language (Magick)", "Dodge"].includes(args.test.item?.name))
    {
         args.test.context.phantasmal = true; // Flag so items aren't readded if test is edited
         let text = `<strong>${this.effect.name}</strong>: Adding Unstable and  Ward`
         args.test.result.other.push(text)  
        this.script.notification(text);
     
        let ward = await fromUuid("Compendium.wfrp4e-core.items.Bvd2aZ0gQUXHfCTh")
        let wardData = ward.toObject();
        wardData.system.specification.value = 9;
        
        let unstable = await fromUuid("Compendium.wfrp4e-core.items.D0ImWEIMSDgElsnl")
        let unstableData = unstable.toObject();
        this.actor.createEmbeddedDocuments("Item", [wardData, unstableData], {fromEffect: this.effect.id})
    }
