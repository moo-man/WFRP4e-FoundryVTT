
let choice = await Dialog.wait({
    title: this.effect.name,
    content: `<p><strong>${this.effect.name}</strong>: Is this a ranged or magical attack that orignates outside the Dome?</p>`,
    buttons: {
        yes: {
            label: "Yes",
            callback: () => {
                return true;
            }
        },
        no: {
            label: "No",
            callback: () => {
                return false;
            }
        }
    }
})

if (choice)
{
	args.ward = 6;
}