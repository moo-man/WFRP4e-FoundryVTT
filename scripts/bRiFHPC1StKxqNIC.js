if (isNaN(parseInt(this.item.system.specification.value))) {
  let value = await ValueDialog.create("Sturdy Value", "Enter the Sturdy value");
  if (value) {
    this.item.updateSource({"system.specification.value" : value});
  }
}