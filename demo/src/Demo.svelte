<script>
    import DragDropList from '../../DragDropList.svelte';
    import CustomItem from './CustomItem.svelte';

    let items = ["a", "b", "c", "d", "e"];

</script>

<div style="height: 100%; display: flex; flex-direction: column;">
    <div style="background-color: blanchedalmond; text-align: center;">
        Some Header <br />
    </div>
    <div
        style="flex: 1; overflow:hidden; background-color: yellow; display: flex; flex-direction: row;"
    >
        <div style="background-color: aqua;">
            Left<br />Stuff
        </div>
        <div
            style="flex: 1; background-color: rebeccapurple; overflow-x: auto;"
        >
            <div
                style="background-color: aliceblue; height: 50%; overflow: auto; display: flex;"
            >
                <div style="margin: auto; text-align: center;">
                    Default DragDropList Items
                    <DragDropList bind:data={items} />
                </div>
            </div>
            <div
                style="background-color: burlywood; height: 50%;  overflow: auto; display: flex;"
            >
                <div style="margin: auto; text-align: center;">
                    Custom DragDropList Items
                    <!-- <DragDropList bind:data={items} ItemComponent={CustomItem} /> -->
                </div>
            </div>
        </div>
        <div style="background-color: cadetblue;">
            Right<br />Stuff
        </div>
    </div>
    <div style="background-color: coral;">
        Some<br />Footer
    </div>
</div>

<style>
    
</style>
