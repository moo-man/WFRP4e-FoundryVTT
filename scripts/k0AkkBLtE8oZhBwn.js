if (isNaN(parseInt(this.item.system.specification.value))) {
  let value = await ValueDialog.create("Armoured Value", "Enter the Armoured value");
  if (value) {
    this.item.updateSource({"system.specification.value" : value});
  }
}