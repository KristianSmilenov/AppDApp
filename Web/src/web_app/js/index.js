(async function () {

    forceMetamask();
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
          getCampaignContractsFromDB()
          .then((campaigns) => {
              self.savedCampaigns = campaigns;
          })
          .catch(err => console.log(err));
        },

        openModal: async function(campaignId) {
            this.campaignDetailData = this.savedCampaigns.find(c => c._id == campaignId);
            var campaignAddress = this.campaignDetailData.fundraiserContractAddress;

            var bal = await getCampaignBalance(campaignAddress);
            var prog = Number(bal) / this.campaignDetailData.minCap * 100;
            var pCount = await getCampaignParticipantsCount(campaignAddress);

            prog = parseInt(Math.min(100, prog));

            this.campaignDetailData.progress = prog;
            this.campaignDetailData.state = await getCampaignState(campaignAddress);
            this.campaignDetailData.participantCount = pCount;

            this.refreshModal();

            $('#myModal').modal();
        },

        participateInCampaign: async function() {
            $('#myModal').modal('hide');

            var userAddress = await getMetaMaskAccount();

            contributeToCampaign(this.campaignDetailData.fundraiserContractAddress, userAddress, Number(this.participationAmount))
            .then()
            .catch(alert)
        },

        refreshModal: function() {
          var b = this.campaignDetailData;
          this.campaignDetailData = {};
          this.campaignDetailData = b;
        },
        
        refreshGrid: function() {
          var b = this.savedCampaigns;
          this.savedCampaigns = [];
          this.savedCampaigns = b;
        }

      },
      created: function () {
        this.fetchContractsFromDB();
      }
    });
  })();