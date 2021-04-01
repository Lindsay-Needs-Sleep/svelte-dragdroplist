<script>
    import { onMount, afterUpdate } from "svelte";
    import {flip} from "svelte/animate";
    import DefaultItem from "./DefaultItem.svelte";
    import { setIntervalWithMax } from './utils.js';

    export let data = [];
    export let ItemComponent = DefaultItem;
    export let itemIdName = 'id';

    $: data && generateWrappedItems(data);
    $: console.log('wrappedItems', wrappedItems[0].data, wrappedItems[0].element, wrappedItems[0].element && wrappedItems[0].element.getBoundingClientRect().top);
    // $: wrappedItems && debounce();

    let wrappedItems = [];
    function generateWrappedItems (itemsToWrap) {
        wrappedItems = itemsToWrap.map((datum, i) => {
            return {
                index: i,
                id: datum[itemIdName] ? datum[itemIdName] : JSON.stringify(datum),
                data: datum, 
            };
        });
    }
// afterUpdate(() => {
//     console.log('afterUpdate wrappedItems', wrappedItems[0].data, wrappedItems[0].element, wrappedItems[0].element && wrappedItems[0].element.getBoundingClientRect().top);
//     // setTimeout(() => {
//     //     console.log('afterUpdate wrappedItems0', wrappedItems[0].data, wrappedItems[0].element, wrappedItems[0].element && wrappedItems[0].element.getBoundingClientRect().top);
//     // }, 0);
//     let count = 0;
//     let interval = setInterval(() => {
//         console.log('afterUpdate wrappedItems1', wrappedItems[0].element && wrappedItems[0].element.getBoundingClientRect().top);
//         count++;
//         if (count > 30) clearInterval(interval);
//     }, 100);
//     // setTimeout(() => {
//     //     console.log('afterUpdate wrappedItems2', wrappedItems[0].data, wrappedItems[0].element, wrappedItems[0].element && wrappedItems[0].element.getBoundingClientRect().top);
//     // }, 2000);
// })
    // function debounce () {
    //     debouncing = true;
    //     // All wrappedItems should have an element when the re-rendering is done
    //     if (wrappedItems.filter(v => v.element).length === data.length) {
    //         debouncing = false;
    //     }
    //     console.log('debounce', debouncing);
    // }

    let ghost;
    let grabbed;

    let lastTarget;
    let itemBounds = [];

    let mouseY = 0; // pointer y coordinate within client
    let offsetY = 0; // y distance from top of grabbed element to pointer
    let layerY = 0; // distance from top of list to top of client

    let debouncing = {};

    // Updates the ghost's position
    $: ghost && grabbed && mouseY && offsetY && layerY && (ghost.style.top = (mouseY + offsetY - layerY) + "px");

    function grab(clientY, element) {
        // modify grabbed element
        grabbed = {
            id: element.dataset.id,
            index: element.dataset.index,
            element: element,
            graby: clientY,
        };

        // modify ghost element (which is actually dragged) to match original item
        ghost.innerHTML = element.innerHTML;
        ghost.style.width = element.offsetWidth + 'px';
        ghost.style.height = element.offsetHeight + 'px';

        // record offset from cursor to top of element
        // (used for positioning ghost)
        offsetY = element.getBoundingClientRect().y - clientY;
        drag(clientY);
    }

    // drag handler updates cursor position
    function drag(clientY) {
        if (!grabbed) return;
        mouseY = clientY;
        layerY = ghost.parentNode.getBoundingClientRect().y;
        let called = false;
        overWhichItem(mouseY, (onItem) => {
            if (called) console.log('already called', called.id, onItem.id);
            called = onItem;
            if (onItem.index === grabbed.index) return;
            moveDatum(grabbed.index, onItem.index);
        });
    }

    // touchEnter handler emulates the mouseenter event for touch input
    // (more or less)
    function touchMove(ev) {
        if (!grabbed) return;
        ev.stopPropagation(); ev.preventDefault();
        ev = ev.touches[0];
        let target = document.elementFromPoint(ev.clientX, ev.clientY).closest(".drag-drop-list-item"); 
        drag(ev.clientY);
        // trigger dragEnter the first time the cursor moves over a list item
        if (target && target !== lastTarget) {
            lastTarget = target;
            dragEnter(target.dataset.index, target.dataset.id);
        }
    }

    function dragEnter(targetIndex, targetId) {
        // swap items in data
        if (grabbed && targetId !== grabbed.id) {
            // moveDatum(grabbed.index, targetIndex);
        }
    }

    // does the actual moving of items in data
    function moveDatum(from, to) {
        from = parseInt(from);
        to = parseInt(to);
        if (to < 0 || to >= data.length || from === to) return;
        if (grabbed) grabbed.index = to;
        debounceItem(from);
        debounceItem(to);
        let temp = data[from];
        data = [...data.slice(0, from), ...data.slice(from + 1)];
        data = [...data.slice(0, to), temp, ...data.slice(to)];
        // notifyDataChange();
    }

    function debounceItem(index) {
        let id = wrappedItems[index].id;
        let element = wrappedItems[index].element;
        let startPos = element.getBoundingClientRect()['top'];
        debouncing[id] = true;
        let lastPos;
        let interval = setIntervalWithMax((reachedMaxTime) => {
            let currentPos = element.getBoundingClientRect()['top'];
            // if the element has settled || if it's been too long
            if (lastPos === currentPos || reachedMaxTime) {
                if (reachedMaxTime) console.log('give up', id, startPos, lastPos, currentPos);
                clearInterval(interval);
                debouncing[id] = false;
            }
            // we started moving, record new position
            if (currentPos !== startPos) lastPos = currentPos;
        }, 200, 3000);
    }

    function notifyDataChange () {
        // Notify data binding that an item has been added/moved/deleted
        data = wrappedItems.map(item => item.data);
    }

    function release(ev) {
        if (grabbed) notifyDataChange();
        grabbed = null;
    }

    function removeDatum(index) {
        wrappedItems = [...wrappedItems.slice(0, index), ...wrappedItems.slice(index + 1)];
    }

    let overWhichItemRetryTimeout; // TODO clear on release
    function overWhichItem (cursorLocation, callback, totalRetryTime = 0) {
        // If we have been triggered non-recursively that means the mouse has moved
        // so kill the retry timeout
        if (!totalRetryTime) clearTimeout(overWhichItemRetryTimeout);
        if (totalRetryTime > 3000) {
            console.log('exceeded retry', debouncing);
            return;
        }

        for (const item of wrappedItems) {
            const bounds = item.element && item.element.getBoundingClientRect();
            if (!bounds) continue;
            const smallerBound = bounds.top;
            const largerBound = bounds.bottom;
            if (cursorLocation > smallerBound && cursorLocation < largerBound) {
                // We are on this item
                if (debouncing[item.id]) {
                    // but if this item is debouncing, we should wait and try again
                    // console.log(`id ${item.id} ${debouncing[item.id]}`);
                    const retryInterval = 10;
                    overWhichItemRetryTimeout = setTimeout(() => {
                        overWhichItem(cursorLocation, callback, totalRetryTime + retryInterval)
                    }, retryInterval);
                    break;
                }
                if (totalRetryTime) console.log('IS RETRY AND FOUND', item.id);
                callback(item);
            }
        }
    }

    onMount(() => {
        // setItemBounds();
    })
</script>

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
<svelte:window 
    on:mouseup={release} 
    on:touchend={release} 
    on:mousemove={(ev) => {drag(ev.clientY);}}
    />
<div 
    class="list {$$props.class || ''}"
    style="{$$props.style || ''}"
        on:touchmove={(ev) => {touchMove(ev);}}
    >
        {#each wrappedItems as wrappedItem, i (wrappedItem.id)}
        <div 
            bind:this={wrappedItem.element}
            class:grabbed={grabbed && (wrappedItem.id === grabbed.id)}
            class="drag-drop-list-item"
            data-index={i}
            data-id={wrappedItem.id}
            data-grabY="0"
            on:mousedown={function(ev) {console.log('lin mousedown');grab(ev.clientY, this);}}
            on:touchstart={function(ev) {console.log('lin touchstart'); grab(ev.touches[0].clientY, this);}}
            on:mouseenter={function(ev) {console.log('lin mouseenter');ev.stopPropagation(); dragEnter(i, wrappedItem.id);}}
            animate:flip|local={{duration: 200}}>
            <svelte:component 
                this={ItemComponent}
                data={wrappedItem.data}
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
        class="ghost"
        class:haunting={grabbed}
        >
    </div>
</div>

<style>
    .list {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .drag-drop-list-item {
        z-index: 10;
    }

    .grabbed {
        opacity: 0;
    }

    .ghost {
        display: none;
        pointer-events: none;
        z-index: 20;
        position: absolute;
    }

    .ghost * {
        pointer-events: none;
    }

    .ghost.haunting {
        display: unset;
    }
</style>