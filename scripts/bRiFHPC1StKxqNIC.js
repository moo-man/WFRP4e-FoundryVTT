if (isNaN(parseInt(this.item.system.specification.value))) {
  let value = await ValueDialog.create({title : "Sturdy Value", text : "Enter the Sturdy value"});
  if (value) {
    this.item.updateSource({"system.specification.value" : value});
  }
}