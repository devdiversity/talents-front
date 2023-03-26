export default onManipulateImage = (event) => {
  if (event && event.scale) {
    console.log(event.scale);
    if (event.scale.factor < 1) {
      event.scale.factor = Math.max(event.scale.factor, Math.min(this.imageSize.width / 2 / this.visibleArea.width, this.imageSize.height / 2 / this.visibleArea.height));
    }
  }
};
