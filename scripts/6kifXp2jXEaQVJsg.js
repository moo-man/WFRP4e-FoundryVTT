let useWard = await foundry.applications.api.DialogV2.confirm({
	content : `<p>Use Ward provided by <strong>${this.effect.name}</strong>?`,
	window : {
		title : this.effect.name,
	}
})

if (useWard)
	args.ward = 9;