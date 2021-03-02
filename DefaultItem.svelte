<script>
    import { createEventDispatcher } from 'svelte';
    
    export let data;
    export let index;
    export let allItems;

    const dispatch = createEventDispatcher();
</script>

<style>
    .item {
        cursor: grab;
        box-sizing: border-box;
        display: inline-flex;
        width: 100%;
        min-height: 3em;
        margin-bottom: 0.5em;
        background-color: white;
        border: 1px solid rgb(190, 190, 190);
        border-radius: 2px;
        user-select: none;
    }

    .item.last-child {
        margin-bottom: 0;
    }

    .item > * {
        margin: auto;
    }

    .buttons {
        width: 32px;
        min-width: 32px;
        margin: auto 0;
        display: flex;
        flex-direction: column;
    }

    .buttons button {
        cursor: pointer;
        width: 18px;
        height: 18px;
        margin: 0 auto;
        padding: 0;
        border: 1px solid rgba(0, 0, 0, 0);
        background-color: inherit;
    }

    .buttons button:focus {
        border: 1px solid black;
    }

    .delete {
        width: 32px;
    }
</style>

<div class="item" class:last-child={index === allItems.length - 1}>
    <div class="buttons">
    <button 
        class="up" 
        style={"visibility: " + (index > 0 ? "" : "hidden") + ";"}
        on:click={() => dispatch('moveup')}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/></svg>
    </button>
    <button 
        class="down" 
        style={"visibility: " + (index < allItems.length - 1 ? "" : "hidden") + ";"}
        on:click={() => dispatch('movedown')}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
    </button>
    </div>

    <div class="content">
    {#if data.html}
        {@html data.html}
    {:else if data.text}
        <p>{data.text}</p>
    {:else}
        <p>{data}</p>
    {/if}
    </div>

    <div class="buttons delete">
    <button
        on:click={() => dispatch('remove')}>
        <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>
    </div>
</div>
