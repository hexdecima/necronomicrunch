export class El {
  // Reference to a new element.
  static create(type) {
    const el = new El();
    el.inner = document.createElement(type);
    return el;
  }
  // Reference to an existing element.
  static fromId(id) {
    const el = new El();
    el.inner = document.getElementById(id);
    return el;
  }

  withClass(className) {
    this.inner.classList.add(className);
    return this;
  }
  withClasses(classes) {
    for (const className of classes) {
      this.inner.classList.add(className);
    }
    return this;
  }
  withId(id) {
    this.inner.id = id;
    return this;
  }
  withChild(child) {
    this.inner.append(child.inner ?? child);
    return this;
  }
  withChildren(children) {
    for (const child of children) {
      this.withChild(child);
    }
    return this;
  }
  withText(text) {
    this.inner.innerText = text;
    return this;
  }
  downcast() {
    return this.inner;
  }
}
