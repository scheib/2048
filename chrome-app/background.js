var syncStorage = {
  data: {},
  serializedData: "",

  setItem: function (id, val) {
    console.log("setItem " + id + val);
    return this.data[id] = String(val);
  },

  getItem: function (id) {
    console.log("getItem " + id);
    return this.data.hasOwnProperty(id) ? this.data[id] : undefined;
  },

  removeItem: function (id) {
    console.log("removeItem " + id);
    return delete this.data[id];
  },

  saveData: function () {
    console.log("saveData");
    var savingData = {};
    savingData["data"] = JSON.stringify(this.data);
    if (savingData.data != this.serializedData) {
      console.log("saveData new data", savingData);
      this.serializedData = savingData.data;
      chrome.storage.sync.set(savingData);
    }
  },

  loadData: function () {
    var that = this;
    chrome.storage.sync.get("data", function(loadedData) {
      console.log("loadData got", loadedData);
      if (loadedData.data &&
          loadedData.data != that.serializedData) {
        console.log("loadData got new data");
        that.serializedData = loadedData.data;
        that.data = JSON.parse(loadedData.data);
        game.setup();
      }
    });
  },

  listenForDataChanges: function () {
    console.log("listenForDataChanges");
    var that = this;
    chrome.storage.onChanged.addListener(function (changes, areaName) {
      console.log("onChanged", changes, areaName);
      that.loadData();
    });
  }
};

syncStorage.listenForDataChanges();

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    id: 'game-window',
    innerBounds: {
      'width':  330,
      'height': 500
    },
    resizable : false
  },
  function (newWindow) {
    // Ensure the background page is available before any script runs.
    newWindow.contentWindow.backgroundPage = window;

    newWindow.contentWindow.onload = function () {
      var doc = newWindow.contentWindow.document;

      // Describe how to play in the header.
      var gameIntro = doc.querySelector(".game-intro");
      gameIntro.innerHTML = "Merge numbers with arrow keys to get the <strong>2048 tile!</strong>"

      // Remove all content below the game.
      var gameContainer = doc.querySelector(".game-container");
      while (gameContainer.nextElementSibling)
        gameContainer.nextElementSibling.remove();
    }

    var saveDataInterval = setInterval(function () {
        syncStorage.saveData();
      }, 7000);

    newWindow.onClosed.addListener(function () {
      console.log("newWindow.contentWindow.onClosed");
      syncStorage.saveData();
      clearInterval(saveDataInterval);
    });
  });
});
