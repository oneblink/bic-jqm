define({
  'data': [
    {
      isAvailable: function () {
        return true;
      },

      implementation: 'data-pouch'
    },

    {
      isAvailable: function () {
        return true;
      },

      implementation: 'data-inMemory'
    }
  ]
})