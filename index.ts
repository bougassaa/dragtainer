export default class Dragtainer {
    current = null;
    rootNode = null;
    parentContainer = null;
    libraryContainer = null;
    maxItemsPerRow = 10;

    parentContainerClass = 'drag-parent-container';
    libraryContainerClass = 'drag-library-container';
    rowClass = 'drag-row';
    itemClass = 'drag-item';
    horizontalClass = 'drag-horizontal';
    dropzoneClass = 'drag-dropzone';
    dropzoneXClass = 'drag-dropzone-x';
    dropzoneYClass = 'drag-dropzone-y';
    dropzoneHoverClass = 'drag-dropzone--hover';
    draggingClass = 'drag-dragging';

    onItemDropCallback = (element: HTMLElement) => {}

    constructor(options: {
        rootNode,
        parentContainer,
        libraryContainer,
        maxItemsPerRow,
        parentContainerClass,
        libraryContainerClass,
        rowClass,
        itemClass,
        horizontalClass,
        dropzoneClass,
        dropzoneXClass,
        dropzoneYClass,
        dropzoneHoverClass,
        draggingClass
    }) {
        this.rootNode = options.rootNode ?? document;
        this.parentContainer = options.parentContainer ?? this.rootNode.querySelector(`.${this.parentContainerClass}`);
        this.libraryContainer = options.libraryContainer ?? this.rootNode.querySelector(`.${this.libraryContainerClass}`);
        this.maxItemsPerRow = options.maxItemsPerRow ?? this.maxItemsPerRow;
        this.parentContainerClass = options.parentContainerClass ?? this.parentContainerClass;
        this.libraryContainerClass = options.libraryContainerClass ?? this.libraryContainerClass;
        this.rowClass = options.rowClass ?? this.rowClass;
        this.itemClass = options.itemClass ?? this.itemClass;
        this.horizontalClass = options.horizontalClass ?? this.horizontalClass;
        this.dropzoneClass = options.dropzoneClass ?? this.dropzoneClass;
        this.dropzoneXClass = options.dropzoneXClass ?? this.dropzoneXClass;
        this.dropzoneYClass = options.dropzoneYClass ?? this.dropzoneYClass;
        this.dropzoneHoverClass = options.dropzoneHoverClass ?? this.dropzoneHoverClass;
        this.draggingClass = options.draggingClass ?? this.draggingClass;
    }

    parentContainerOver = (event) => {
        let rect = this.parentContainer.getBoundingClientRect();
        let threshold = 100;
        let speed = 10;

        if (event.clientY > rect.bottom - threshold) {
            this.parentContainer.scrollTop += speed;
        }

        if (event.clientY < rect.top + threshold) {
            this.parentContainer.scrollTop -= speed;
        }
    }

    dropzoneOver = event => {
        if (this.preventHorizontalDrop(event)) {
            return;
        }

        event.preventDefault();

        this.addDropzoneHighlight(event.target);
    }

    dropzoneLeave = event => {
        this.removeDropzoneHighlight(event.target);
    }

    dropzoneEnd = event => {
        this.dropzoneLeave(event);
        this.replaceDropzoneByItem(event.target);
    }

    horizontalItemOver = event => {
        if (this.preventHorizontalDrop(event)) {
            return;
        }

        event.preventDefault();

        let dropzoneLeft = event.target.previousElementSibling;
        let dropzoneRight = event.target.nextElementSibling;

        if (this.isLeftDropzoneOvered(event)) {
            this.addDropzoneHighlight(dropzoneLeft);
            this.removeDropzoneHighlight(dropzoneRight);
        } else {
            this.addDropzoneHighlight(dropzoneRight);
            this.removeDropzoneHighlight(dropzoneLeft);
        }
    }

    horizontalItemLeave = event => {
        this.removeDropzoneHighlight(event.target.nextElementSibling);
        this.removeDropzoneHighlight(event.target.previousElementSibling);
    }

    horizontalItemEnd = event => {
        this.horizontalItemLeave(event);

        if (this.isLeftDropzoneOvered(event)) {
            this.replaceDropzoneByItem(event.target.previousElementSibling);
        } else {
            this.replaceDropzoneByItem(event.target.nextElementSibling);
        }
    }

    isLeftDropzoneOvered(event) {
        return event.offsetX < (event.target.offsetWidth / 2);
    }

    addDropzoneHighlight(dropzone) {
        if (dropzone instanceof HTMLElement && dropzone.classList.contains(this.dropzoneClass)) {
            dropzone.classList.add(this.dropzoneHoverClass);
        }
    }

    removeDropzoneHighlight(dropzone) {
        if (dropzone instanceof HTMLElement) {
            dropzone.classList.remove(this.dropzoneHoverClass);
        }
    }

    preventHorizontalDrop(event) {
        let dropzoneParent = event.target.parentElement;
        let parentHasRowClass = dropzoneParent.classList.contains(this.rowClass);
        let hasHorizontalChild = dropzoneParent.querySelector(`.${this.horizontalClass}`);
        let currentHasHorizontalClass = this.current.classList.contains(this.horizontalClass);
        let numberOfItemsInRow = dropzoneParent.querySelectorAll(`.${this.itemClass}`).length;

        return parentHasRowClass && (!currentHasHorizontalClass || !hasHorizontalChild || numberOfItemsInRow >= this.maxItemsPerRow);
    }

    replaceDropzoneByItem(dropzone) {
        if (dropzone instanceof HTMLElement) {
            let dropzoneParent = dropzone.parentElement, row;

            if (!dropzoneParent.classList.contains(this.rowClass)) {
                row = document.createElement("div");
                row.classList.add(this.rowClass);
                row.appendChild(this.current);
            }

            dropzone.replaceWith(row ?? this.current);

            this.onItemDropCallback(this.current);
            this.initialize();
        }
    }

    initialize() {
        this.parentContainer.ondragover = event => this.parentContainerOver(event);

        this.removeExistingDropzone();
        this.initializeRows();
        this.initializeItems();
        this.handleDefaultDropzone();

        return this;
    }

    removeExistingDropzone() {
        this.parentContainer.querySelectorAll(`.${this.dropzoneClass}`).forEach(dropzone => dropzone.remove());
    }

    initializeRows() {
        this.parentContainer.querySelectorAll(`.${this.rowClass}`).forEach(row => {
            if (!row.querySelector(`.${this.itemClass}`)) { // remove empty row
                row.remove();
            } else {
                this.insertDropzone(row);
            }
        });
    }

    initializeItems() {
        [this.parentContainer, this.libraryContainer].forEach(container => {
            if (container instanceof HTMLElement) {
                container.querySelectorAll(`.${this.itemClass}`).forEach(item => {
                    if (item.hasAttribute('draggable')) {
                        this.registerDraggableItem(item);
                    }
                    this.insertDropzone(item);
                })
            }
        });
    }

    handleDefaultDropzone() {
        if (!this.parentContainer.querySelector(`.${this.dropzoneClass}`)) {
            let dropzone = this.createDropzone(this.parentContainer);
            this.parentContainer.append(dropzone);
        }
    }

    insertDropzone(element) {
        if (this.canHaveDropzone(element)) {
            if (element.parentElement.firstElementChild === element) {
                element.insertAdjacentElement('beforebegin', this.createDropzone(element));
            }
            element.insertAdjacentElement('afterend', this.createDropzone(element));
        }
    }

    createDropzone(elem) {
        let dropzone = document.createElement("div");

        if (elem.classList.contains(this.itemClass)) {
            dropzone.classList.add(this.dropzoneYClass);
        } else {
            dropzone.classList.add(this.dropzoneXClass);
        }

        dropzone.classList.add(this.dropzoneClass);
        dropzone.ondragover = this.dropzoneOver;
        dropzone.ondragleave = this.dropzoneLeave;
        dropzone.ondrop = this.dropzoneEnd;

        return dropzone;
    }

    registerDraggableItem(item) {
        item.ondragstart = () => {
            item.classList.add(this.draggingClass);
            this.current = item; // set current dragged item
        }

        item.ondragend = () => {
            item.classList.remove(this.draggingClass);
        }

        if (item.classList.contains(this.horizontalClass) && this.canHaveDropzone(item)) {
            item.ondragover = this.horizontalItemOver;
            item.ondragleave = this.horizontalItemLeave;
            item.ondrop = this.horizontalItemEnd;
        }
    }

    canHaveDropzone(element) {
        return element.closest(`.${this.rowClass}`) instanceof HTMLElement;
    }

    onItemDrop(callback) {
        this.onItemDropCallback = callback;
    }

    getItemsPositions() {
        let positions = [];
        let rowIndex = 0;

        this.rootNode.querySelectorAll(`.${this.rowClass}`).forEach(row => {
            let colIndex = 0;
            row.querySelectorAll(`.${this.itemClass}`).forEach(item => {
                positions.push({ row: rowIndex, col: colIndex, item: item });
                colIndex++;
            })
            rowIndex++;
        });

        return positions;
    }
}