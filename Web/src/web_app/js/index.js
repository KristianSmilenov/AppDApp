
(function () {

    initWeb3();
    initAccount();
    $('#myModal').modal('hide');
  
    var app = new Vue({
      el: '#app',
      data: {
        modalVisible: true,
        savedCampaigns: [],
        campaignDetailData: {description: 'asd'}
      },
      methods: {
        fetchContractsFromDB: function () {
          var self = this;
          getContractsFromDB()
          .then((campaigns) => {
              self.savedCampaigns = campaigns;
          })
          .catch(err => console.log(err));
        },

        openModal: function(campaignId) {
            this.campaignDetailData = this.savedCampaigns.find(c => c._id == campaignId);
            $('#myModal').modal();
        },

        participateInCampaign: function() {
            $('#myModal').modal('hide');
            var campaign = this.campaignDetailData;
        }
      },
      created: function () {
        this.fetchContractsFromDB();
      }
    });
  })();