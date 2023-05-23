function Dragtainer(options = {}) {
    const defaultValues = {
        parentContainerClass: 'drag-parent-container',
        libraryContainerClass: 'drag-library-container',
        rowClass: 'drag-row',
        itemClass: 'drag-item',
        horizontalClass: 'drag-horizontal',
        dropzoneClass: 'drag-dropzone',
        dropzoneXClass: 'drag-dropzone-x',
        dropzoneYClass: 'drag-dropzone-y',
        dropzoneHoverClass: 'drag-dropzone--hover',
        draggingClass: 'drag-dragging',
        maxItemsPerRow: 10,
        rootNode: document
    };

    for (const prop in defaultValues) {
        if (options.hasOwnProperty(prop)) {
            this[prop] = options[prop];
        } else {
            this[prop] = defaultValues[prop];
        }
    }

    if (options.hasOwnProperty('parentContainer')) {
        this.parentContainer = options.parentContainer;
    } else {
        this.parentContainer = this.rootNode.querySelector(`.${this.parentContainerClass}`);
    }

    if (options.hasOwnProperty('libraryContainer')) {
        this.libraryContainer = options.libraryContainer;
    } else {
        this.libraryContainer = this.rootNode.querySelector(`.${this.libraryContainerClass}`);
    }

    let onItemDropCallback = () => {};

    this.parentContainerOver = (event) => {
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

    this.dropzoneOver = event => {
        if (this.preventHorizontalDrop(event)) {
            return;
        }

        event.preventDefault();

        this.addDropzoneHighlight(event.target);
    }

    this.dropzoneLeave = event => {
        this.removeDropzoneHighlight(event.target);
    }

    this.dropzoneEnd = event => {
        this.dropzoneLeave(event);
        this.replaceDropzoneByItem(event.target);
    }

    this.horizontalItemOver = event => {
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

    this.horizontalItemLeave = event => {
        this.removeDropzoneHighlight(event.target.nextElementSibling);
        this.removeDropzoneHighlight(event.target.previousElementSibling);
    }

    this.horizontalItemEnd = event => {
        this.horizontalItemLeave(event);

        if (this.isLeftDropzoneOvered(event)) {
            this.replaceDropzoneByItem(event.target.previousElementSibling);
        } else {
            this.replaceDropzoneByItem(event.target.nextElementSibling);
        }
    }

    this.isLeftDropzoneOvered = (event) => {
        return event.offsetX < (event.target.offsetWidth / 2);
    }

    this.addDropzoneHighlight = (dropzone) => {
        if (dropzone instanceof HTMLElement && dropzone.classList.contains(this.dropzoneClass)) {
            dropzone.classList.add(this.dropzoneHoverClass);
        }
    }

    this.removeDropzoneHighlight = (dropzone) => {
        if (dropzone instanceof HTMLElement) {
            dropzone.classList.remove(this.dropzoneHoverClass);
        }
    }

    this.preventHorizontalDrop = (event) => {
        let dropzoneParent = event.target.parentElement;
        let parentHasRowClass = dropzoneParent.classList.contains(this.rowClass);
        let hasHorizontalChild = dropzoneParent.querySelector(`.${this.horizontalClass}`);
        let currentHasHorizontalClass = this.current.classList.contains(this.horizontalClass);
        let numberOfItemsInRow = dropzoneParent.querySelectorAll(`.${this.itemClass}`).length;

        return parentHasRowClass && (!currentHasHorizontalClass || !hasHorizontalChild || numberOfItemsInRow >= this.maxItemsPerRow);
    }

    this.replaceDropzoneByItem = (dropzone) => {
        if (dropzone instanceof HTMLElement) {
            let dropzoneParent = dropzone.parentElement, row;

            if (!dropzoneParent.classList.contains(this.rowClass)) {
                row = document.createElement("div");
                row.classList.add(this.rowClass);
                row.appendChild(this.current);
            }

            dropzone.replaceWith(row ? row : this.current);

            this.onItemDropCallback(this.current);
            this.initialize();
        }
    }

    this.initialize = () => {
        this.parentContainer.ondragover = event => this.parentContainerOver(event);

        this.removeExistingDropzone();
        this.initializeRows();
        this.initializeItems();
        this.handleDefaultDropzone();

        return this;
    }

    this.removeExistingDropzone = () => {
        this.parentContainer.querySelectorAll(`.${this.dropzoneClass}`).forEach(dropzone => dropzone.remove());
    }

    this.initializeRows = () => {
        this.parentContainer.querySelectorAll(`.${this.rowClass}`).forEach(row => {
            if (!row.querySelector(`.${this.itemClass}`)) { // remove empty row
                row.remove();
            } else {
                this.insertDropzone(row);
            }
        });
    }

    this.initializeItems = () => {
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

    this.handleDefaultDropzone = () => {
        if (!this.parentContainer.querySelector(`.${this.dropzoneClass}`)) {
            let dropzone = this.createDropzone(this.parentContainer);
            this.parentContainer.append(dropzone);
        }
    }

    this.insertDropzone = (element) => {
        if (this.canHaveDropzone(element)) {
            if (element.parentElement.firstElementChild === element) {
                element.insertAdjacentElement('beforebegin', this.createDropzone(element));
            }
            element.insertAdjacentElement('afterend', this.createDropzone(element));
        }
    }

    this.createDropzone = (elem) => {
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

    this.registerDraggableItem = (item) => {
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

    this.canHaveDropzone = (element) => {
        return element.closest(`.${this.rowClass}`) instanceof HTMLElement;
    }

    this.onItemDrop = (callback) => {
        this.onItemDropCallback = callback;
    }

    this.getItemsPositions = () => {
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

export default Dragtainer;