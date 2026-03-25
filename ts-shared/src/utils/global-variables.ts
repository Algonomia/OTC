export namespace GlobalVariables {
    export const INTL_COLLATOR = new Intl.Collator(); // Use this so cause initializing it many times leads to optim issues (when sorting arrays for example)
    export const INTL_COLLATOR_FOR_INTS = new Intl.Collator(undefined, {numeric: true}); // Use this so cause initializing it many times leads to optim issues (when sorting arrays for example)
}
