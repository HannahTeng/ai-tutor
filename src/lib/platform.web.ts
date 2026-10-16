export async function fullScreen() {
  if (document.fullscreenElement) await document.exitFullscreen();
  else if (document.documentElement.requestFullscreen)
    await document.documentElement.requestFullscreen();
  else throw new Error("当前浏览器不支持全屏，可以使用浏览器的全屏菜单。");
}
