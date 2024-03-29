<script lang="ts">
import {
  getChurnRate,
  getLifetimeValue,
  getRecurringRevenue,
} from "./services/metrics.service";
import ChurnChart from "./components/charts/ChurnChart.vue";
import RevenueChart from "./components/charts/RevenueChart.vue";
import {
  ChurnRate,
  LifetimeValue,
  RecurringRevenue,
  SubscriptionPlanFilter,
} from "./models/metrics.model";

  // Options based component
export default {
  data(): {
    churnRateData: ChurnRate[];
    recurringRevenueData: RecurringRevenue[];
    lifetimeValueData: { data: LifetimeValue[]; total: LifetimeValue };
    fileUploaded?: File;
    selectedYear: number;
    availableYears: { text: string; value: number }[];
    selectedPlanFilter: SubscriptionPlanFilter;
    tab: string;
    chartKeys: number;
    snackbar: boolean;
  } {
    return {
      churnRateData: [],
      recurringRevenueData: [],
      lifetimeValueData: { data: [], total: {} as LifetimeValue },
      fileUploaded: undefined,
      selectedYear: 0,
      availableYears: [{ text: "All", value: 0 }],
      selectedPlanFilter: "All",
      tab: "one",
      chartKeys: 0,
      snackbar: false,
    };
  },
  methods: {
    async onUpload(e: Event): Promise<void> {
      const uploadedFile = ((<HTMLInputElement>e.target).files || [])[0];

      try {
        this.churnRateData = await getChurnRate({}, uploadedFile);
        this.recurringRevenueData = await getRecurringRevenue({}, uploadedFile);
        this.lifetimeValueData = await getLifetimeValue({}, uploadedFile);

        if (!this.churnRateData) {
          this.snackbar = true;
        }

        this.churnRateData.map((data) => {
          const year = data.relatesTo.split("-")[1];
          this.availableYears.push({ text: year, value: parseInt(year) });
        });

        this.fileUploaded = uploadedFile;
      } catch (error) {
        this.snackbar = true;
      }
    },
    async useTestFile() {
      this.churnRateData = await getChurnRate({});
      this.recurringRevenueData = await getRecurringRevenue({});
      this.lifetimeValueData = await getLifetimeValue({});

      this.churnRateData.map((data) => {
        const year = data.relatesTo.split("-")[1];
        this.availableYears.push({ text: year, value: parseInt(year) });
      });

      this.fileUploaded = {} as File;
    },
  },
  watch: {
    async selectedYear(year) {
      const churnResponse = await getChurnRate(
        {
          year,
          filterSubscriptionPlan: this.selectedPlanFilter,
        },
        this.fileUploaded
      );

      const revenueResponse = await getRecurringRevenue(
        {
          year,
          filterSubscriptionPlan: this.selectedPlanFilter,
        },
        this.fileUploaded
      );

      const lifetimeResponse = await getLifetimeValue(
        {
          year,
          filterSubscriptionPlan: this.selectedPlanFilter,
        },
        this.fileUploaded
      );

      this.churnRateData = churnResponse;
      this.recurringRevenueData = revenueResponse;
      this.lifetimeValueData = lifetimeResponse;
      this.chartKeys += 1;
    },

    async selectedPlanFilter(filterSubscriptionPlan) {
      const churnResponse = await getChurnRate(
        {
          year: this.selectedYear,
          filterSubscriptionPlan,
        },
        this.fileUploaded
      );

      const revenueResponse = await getRecurringRevenue(
        {
          year: this.selectedYear,
          filterSubscriptionPlan,
        },
        this.fileUploaded
      );

      const lifetimeResponse = await getLifetimeValue(
        {
          year: this.selectedYear,
          filterSubscriptionPlan,
        },
        this.fileUploaded
      );

      this.churnRateData = churnResponse;
      this.recurringRevenueData = revenueResponse;
      this.lifetimeValueData = lifetimeResponse;
      this.chartKeys += 1;
    },
  },
};
</script>

<template>
  <v-app class="bg-grey-darken-4">
    <v-main>
      <v-toolbar title="📈 Metrics Dashboard" class="bg-purple-darken-4" />
      <v-container v-if="!fileUploaded">
        <welcome-message />
        <upload-button @onUpload="onUpload" @onTestFileClick="useTestFile" />
      </v-container>
      <v-container v-else class="chart-container">
        <h1>Graphs</h1>
        <v-card variant="outlined" class="options-card">
          <chart-options
            :availableYears="availableYears"
            v-model:selectedYear="selectedYear"
            v-model:selectedPlanFilter="selectedPlanFilter"
          />
        </v-card>
        <div class="charts">
          <chart-tabs v-model:tab="tab">
            <template v-slot:churn-chart>
              <churn-chart :churnRateData="churnRateData" :key="chartKeys" />
            </template>
            <template v-slot:revenue-chart>
              <revenue-chart
                :recurringRevenueData="recurringRevenueData"
                :key="chartKeys"
              />
            </template>
            <template v-slot:lifetime-chart>
              <lifetime-chart
                :lifetimeValueData="lifetimeValueData"
                :key="chartKeys"
              />
            </template>
          </chart-tabs>
        </div>
      </v-container>
      <v-snackbar v-model="snackbar">
        The file could not be uploaded.

        <template v-slot:actions>
          <v-btn color="pink" variant="text" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<style scoped>
h1 {
  margin: 2rem 0;
  text-align: center;
}

.options-card {
  text-align: center;
  width: 40%;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.charts {
  width: 100%;
  margin-top: 80px;
}
</style>
