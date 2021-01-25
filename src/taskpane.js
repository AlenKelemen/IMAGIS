
export default class Taskpane {
  constructor(options = {}) {
    this.ux = options.ux;
    const task = this.ux.addTask({
      taskbar: options.taskbar,
      html: options.html || '<i class="far fa-layer-group"></i>',
      tipLabel: options.tipLabel || "Tasktezjetzjertju",
      className: options.className || "task",
    });
    task.toggle.on("change:active", (evt) => {
      this.ux.hide(task.container, !evt.active);
    });

    task.container.element.style.width = "100px";
    task.container.element.style.backgroundColor = "blue";
  }
}
