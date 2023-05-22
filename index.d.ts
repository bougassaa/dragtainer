declare class Dragtainer {
    current?: HTMLElement;
    rootNode?: HTMLElement;
    parentContainer?: HTMLElement;
    libraryContainer?: HTMLElement;
    maxItemsPerRow: number;

    parentContainerClass: string;
    libraryContainerClass: string;
    rowClass: string;
    itemClass: string;
    horizontalClass: string;
    dropzoneClass: string;
    dropzoneXClass: string;
    dropzoneYClass: string;
    dropzoneHoverClass: string;
    draggingClass: string;

    constructor(options: Object);

    onItemDropCallback: Function;
    parentContainerOver: Function;
    dropzoneOver: Function;
    dropzoneLeave: Function;
    dropzoneEnd: Function;
    horizontalItemOver: Function;
    horizontalItemLeave: Function;
    horizontalItemEnd: Function;

    isLeftDropzoneOvered(event: Event): boolean;
    addDropzoneHighlight(dropzone: HTMLElement): void;
    removeDropzoneHighlight(dropzone: HTMLElement): void;
    preventHorizontalDrop(event: Event): boolean;
    replaceDropzoneByItem(dropzone: HTMLElement): void;
    initialize(): Dragtainer;
    removeExistingDropzone(): void;
    initializeRows(): void;
    initializeItems(): void;
    handleDefaultDropzone(): void;
    insertDropzone(element: Event): void;
    createDropzone(elem: HTMLElement): HTMLElement;
    registerDraggableItem(item: HTMLElement): void;
    canHaveDropzone(element: HTMLElement): void;
    onItemDrop(callback: Function): void;
    getItemsPositions(): Array<object>;
}

export default Dragtainer;