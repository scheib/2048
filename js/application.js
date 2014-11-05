var game;
// Wait till the browser is ready to render the game (avoids glitches)
console.log("application.js about to call requestAnimationFrame")
window.requestAnimationFrame(function () {
  game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
  backgroundPage.game = game;
  backgroundPage.syncStorage.loadData();
});
