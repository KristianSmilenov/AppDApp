
(function () {

    initWeb3();
    initAccount();
  
    var app = new Vue({
      el: '#app',
      data: {
        savedCampaigns: [],
      },
      methods: {
        fetchContractsFromDB: function () {
          var self = this;
          getContractsFromDB()
          .then((campaigns) => {
              self.savedCampaigns = campaigns;
          })
          .catch(err => console.log(err));
        }
      },
      created: function () {
        this.fetchContractsFromDB();
      }
    });
  })();