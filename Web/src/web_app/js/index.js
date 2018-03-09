(function () {

    initWeb3();

    $('#myModal').modal('hide');
  
    var app = new Vue({
      el: '#app',
      data: {
        modalVisible: true,
        savedCampaigns: [],
        campaignDetailData: {description: 'asd'},
        participationAmount: 0
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

        participateInCampaign: async function() {
            $('#myModal').modal('hide');

            var userAddress = await getMetaMaskAccount();

            contributeToCampaign(this.campaignDetailData.fundraiserContractAddress, userAddress, Number(this.participationAmount))
            .then()
            .catch(alert)
        }
      },
      created: function () {
        this.fetchContractsFromDB();
      }
    });
  })();