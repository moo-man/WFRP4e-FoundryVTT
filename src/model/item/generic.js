import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class GenericAspectModel extends BaseItemModel
{
    static placement = "talents"
    static label = "Aspect"
    static plural = "Aspects"

    /**
     * Used to identify an Item as one being a child or instance of GenericAspectModel
     *
     * @final
     * @returns {boolean}
     */
    get isAspect() {
        return true;
    }

    get tags() {
        return super.tags.add("aspect");
    }

    get placement() 
    {
        return this.constructor.placement;
    }

    get label() 
    {
        return this.constructor.label;
    }
    
    get pluralLabel() 
    {
        return this.constructor.plural;
    }

    /**
     * Whether the Aspect can be "used" or not. Usage may – depending on Aspect – mean Rolling, initiating a Test,
     * or doing something else entirely.
     *
     * @returns {boolean}
     * @public
     */
    get usable()
    {
        return false;
    }

    /**
     * Method which serves as a public wrapper for _performUsage() method, while also calling a pre-use and post-use hook.
     *
     * @param {{}} options
     *
     * @returns {Promise<TestWFRP|Roll|null>}
     * @public
     */
    async use(options = {})
    {
        if (!this.usable)
            return null;

        if (!Hooks.call('wfrp4e:beforeUseAspect', this.parent, options))
            return null;

        const result = await this._performUsage(options);

        Hooks.callAll('wfrp4e:afterUseAspect', this.parent, result, options);

        return result;
    }

    /**
     * Method which should implement entire logic behind "using an Aspect" such as rolling or initiating a Test.
     *
     * Should return either object of TestWFRP class, object of Roll class or null if Aspect is not rollable.
     *
     * @returns {Promise<TestWFRP|Roll|null>}
     * @protected
     */
    async _performUsage({} = {})
    {
        return null;
    }
}