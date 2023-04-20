# Dragtainer

`dragtainer` is used to place DOM elements in row and column. Using native Drag and Drop, compatible on all browsers.

## How to use
For dragtainer to work it is important to: 
- **add style**, here is a style you can add and are free to change (_Note : It is strongly advised to use Flexbox, to have a better experience_):

```css
.drag-item {
    flex: 1;
    cursor: grab;
    background: #d3c1f6;
    padding: 20px 14px;
}

.drag-row {
    display: flex;
    align-items: stretch;
}

.drag-dropzone {
    flex-shrink: 0;
}

.drag-dropzone-y {
    width: 20px;
}

.drag-dropzone-x {
    height: 20px;
}

.drag-dropzone-x:last-child {
    flex-grow: 1;
}

.drag-dropzone.drag-dropzone--hover {
    background: #98d9ff;
}
```

- Add the `[draggable=true]` attribute on the `.drag-item` that need to be moved.
- Put element `.drag-item` in `.drag-row`.
- For a block to be placed on the same line as another, you must add `.drag-horizontal` class to `.drag-item` element.
- Call `new Dragtainer().initialize();`

Here is a basic example:

```html
<div class="drag-parent-container">
    <div class="drag-row">
        <div class="drag-item" draggable="true">block 1</div>
    </div>
    <div class="drag-row">
        <div class="drag-item" draggable="true">block 2</div>
    </div>
    <div class="drag-row">
        <div class="drag-item drag-horizontal" draggable="true">block 3.1 (can be horizontally)</div>
        <div class="drag-item drag-horizontal" draggable="true">block 3.2 (can be horizontally)</div>
    </div>
    <div class="drag-row">
        <div class="drag-item drag-horizontal" draggable="true">block 4 (can be horizontally)</div>
    </div>
</div>
```

## Library
It's a container that has `.drag-item` ready to be moved into the `.drag-parent-container`. The movement is only in one direction, from library to drag container:

```html
<div class="drag-library-container">
    <div class="drag-item" draggable="true">block 1</div>
    <div class="drag-item" draggable="true">block 2</div>
    <div class="drag-item drag-horizontal" draggable="true">block 3 (can be horizontally)</div>
    <div class="drag-item drag-horizontal" draggable="true">block 4 (can be horizontally)</div>
</div>
```

## Options/Methods
Options can be passed in the Dragtainer constructor:

```js
let dragtainer = new Dragtainer({
    rootNode: document, // root node using to scope DOM queries (can be modal, div container...)
    parentContainer: rootNode.querySelector('.drag-parent-container'), // the parent container for the DnD
    libraryContainer: rootNode.querySelector('.drag-library-container'), // the library container that contain items which can be dragged into the container
    maxItemsPerRow: 10, // max blocs by rows

    parentContainerClass: 'drag-parent-container', // parent DnD container
    libraryContainerClass: 'drag-library-container', // library container
    rowClass: 'drag-row', // row that contain items
    itemClass: 'drag-item', // item block wich can be dragged
    horizontalClass: 'drag-horizontal', // allows to activate the horizontal drag (several blocks on the same row)
    dropzoneClass: 'drag-dropzone', // spacing between blocks (where blocks can be dropped)
    dropzoneXClass: 'drag-dropzone-x', // horizontal spacing
    dropzoneYClass: 'drag-dropzone-y', // vertical spacing
    dropzoneHoverClass: 'drag-dropzone--hover', // when block it's hover dropzone
    draggingClass: 'drag-dragging', // when item is dragging state
})

dragtainer.initialize(); // initialize dropzones between blocks and activate DnD behaviors
dragtainer.getItemsPositions(); // returns an array with the positions (row, col and the HTML element)
```