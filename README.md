# Svelte-DragDropList

Sortable lists [made with Svelte](https://madewithsvelte.com/svelte-dragdroplist).  [Available from NPM!](https://www.npmjs.com/package/svelte-dragdroplist)  

### Why this component?

* Bidirectional binding - data order updates as soon as the user drags a list item into a new position, even before it is dropped
* Full touch support - doesn't use the HTML5 drag and drop API
* Accessible - includes buttons to move elements without dragging
* Easier than writing a new one, probably.

### Usage

[Basic REPL](https://svelte.dev/repl/6fb61b9868734493aec65eb53dc1a4bd?version=3.22.2)  
[REPL with every feature!](https://svelte.dev/repl/915db3b3ed704fddb7ddfb64bcbc2624?version=3.22.2)  

The simplest way to use the component is to pass it an array of strings.  If you `bind:data`, the source array will be updated as the user rearranges its items.
```js
<script>
    import DragDropList from "svelte-dragdroplist";

    let items = ["Adams", "Boston", "Chicago", "Denver"];
</script>

<DragDropList bind:data={items} ItemComponent={YourSvelteComponent} itemIdName={"uuid"} />
```

#### ItemComponent

(optional) ItemComponent is Svelte component.
If you pass one, it will be called like this:

```
<YourSvelteItemComponent 
    data={items[i]}
    index={i}        // Mostly for reference for making display decisions
    allItems={items} // Mostly for reference for making display decisions
    on:moveup
    on:movedown
    on:remove
/>
```
You must dispatch the `moveup`, `movedown`, `remove` events if they are triggered by UI in YourSvelteItemComponent.

Note: _adding_ items is as simple as adding them to the data array.

##### Unique IDs

If you aren't sure that your strings will be unique, you should instead pass an array of objects, each with a unique ID:  

```js
let data = [{"id": 0, "text": "Boston"},
            {"id": 1, "text": "Boston"},
            {"id": 2, "text": "Chicago"},
            {"id": 3, "text": "Denver"}];
```

If the item's ID is not named `id`, you can customize it by setting `itemIdName`:

##### Default ItemComponent

The default ItemComponent will be used if no `ItemComponent` is specified.
It accepts items in any of the formats shown here.  (You can mix formats.)
```js
let data = ["Chicago", 
            "Denver",
            {"text": "Adams"},
            {"text": "Boston"},
            {"html": "<p style='color: blue;'>Chicago</p>"},
            {"html": "<p style='color: red;'>Denver</p>"}];
```

### Styling

You can pass values to `class` and `style` to style the list container.

```
<DragDropList class="" style="" />
```

To style your items it is recommended to supply a custom `ItemComponent`.

### In Progress

* Additional animations on drop
