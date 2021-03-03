<script>
    import {flip} from "svelte/animate";
    import DefaultItem from "./DefaultItem.svelte";

    export let data = [];
    export let ItemComponent = DefaultItem;
    export let itemIdName = 'id';

    $: items = data.map((datum, i) => {
        return {
            id: `${i}-${new Date().valueOf() + Math.random()}`,
            data: datum, 
        };
    });

    let ghost;
    let grabbed;

    let lastTarget;

    let mouseY = 0; // pointer y coordinate within client
    let offsetY = 0; // y distance from top of grabbed element to pointer
    let layerY = 0; // distance from top of list to top of client

    function grab(clientY, element) {
        // modify grabbed element
        grabbed = element;
        grabbed.dataset.grabY = clientY;

        // modify ghost element (which is actually dragged)
        ghost.innerHTML = grabbed.innerHTML;

        // record offset from cursor to top of element
        // (used for positioning ghost)
        offsetY = grabbed.getBoundingClientRect().y - clientY;
        drag(clientY);
    }

    // drag handler updates cursor position
    function drag(clientY) {
        if (grabbed) {
            mouseY = clientY;
            layerY = ghost.parentNode.getBoundingClientRect().y;
        }
    }

    // touchEnter handler emulates the mouseenter event for touch input
    // (more or less)
    function touchEnter(ev) {       
        drag(ev.clientY);
        // trigger dragEnter the first time the cursor moves over a list item
        let target = document.elementFromPoint(ev.clientX, ev.clientY).closest(".item");
        if (target && target != lastTarget) {
            lastTarget = target;
            dragEnter(ev, target);
        }
    }

    function dragEnter(ev, target) {
        // swap items in data
        if (grabbed && target != grabbed && target.classList.contains("item")) {
            moveDatum(parseInt(grabbed.dataset.index), parseInt(target.dataset.index));
        }
    }

    // does the actual moving of items in data
    function moveDatum(from, to) {
        if (to < 0 || to >= items.length) return;
        let temp = items[from];
        items = [...items.slice(0, from), ...items.slice(from + 1)];
        items = [...items.slice(0, to), temp, ...items.slice(to)];
    }

    function release(ev) {
        if (grabbed) {
            // Notify data binding that an item has moved
            data = items.map(item => item.data);
        }
        grabbed = null;
    }

    function removeDatum(index) {
        items = [...items.slice(0, index), ...items.slice(index + 1)];
    }
</script>

<style>
    .list {
        position: relative;
        z-index: 5;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .item:not(.grabbed):not(.ghost) {
        z-index: 10;
    }

    .grabbed {
        opacity: 0.0;
    }

    .ghost {
        pointer-events: none;
        z-index: -5;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.0;
    }

    .ghost * {
        pointer-events: none;
    }

    .ghost.haunting {
        z-index: 20;
        opacity: 1.0;
    }
</style>

<svelte:window on:mouseup={release} />

<!-- All the documentation has to go up here, sorry.
     (otherwise it conflicts with the HTML or svelte/animate) 
     The .list has handlers for pointer movement and pointer up/release/end.
     Each .item has a handler for pointer down/click/start, which assigns that
     element as the item currently being "grabbed".  They also have a handler
     for pointer enter (the touchmove handler has extra logic to behave like the
     no longer extant 'touchenter'), which swaps the entered element with the
     grabbed element when triggered.
     You'll also find reactive styling below, which keeps it from being directly
     part of the imperative javascript handlers. -->
<div 
    class="list {$$props.class}"
    style="{$$props.style}"
    on:mousemove={function(ev) {ev.stopPropagation(); drag(ev.clientY);}}
    on:touchmove={function(ev) {ev.stopPropagation(); drag(ev.touches[0].clientY);}}
    on:touchend={function(ev) {ev.stopPropagation(); release(ev.touches[0]);}}>
        {#each data as datum, i (datum[itemIdName] ? datum[itemIdName] : JSON.stringify(datum))}
        <div 
                class:grabbed={(grabbed && (datum[itemIdName] ? datum[itemIdName] : JSON.stringify(datum)) == grabbed.dataset.id)}
            class="item"
            data-index={i}
                data-id={(datum[itemIdName] ? datum[itemIdName] : JSON.stringify(datum))}
            data-grabY="0"
            on:mousedown={function(ev) {grab(ev.clientY, this);}}
            on:touchstart={function(ev) {grab(ev.touches[0].clientY, this);}}
            on:mouseenter={function(ev) {ev.stopPropagation(); dragEnter(ev, ev.target);}}
            on:touchmove={function(ev) {ev.stopPropagation(); ev.preventDefault(); touchEnter(ev.touches[0]);}}
            animate:flip|local={{duration: 200}}>
            <svelte:component 
                this={ItemComponent}
                data={item.data}
                index={i}
                allItems={data}
                on:moveup={function(ev) {moveDatum(i, i - 1)}}
                on:movedown={function(ev) {moveDatum(i, i + 1)}}
                on:remove={function(ev) {removeDatum(i);}}
                />
        </div>
    {/each}
    <div
        bind:this={ghost}
        class="item ghost"
        class:haunting={grabbed}
        style={"top: " + (mouseY + offsetY - layerY) + "px"}><p></p></div>
</div>
