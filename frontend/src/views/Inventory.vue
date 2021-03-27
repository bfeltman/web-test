<template>
  <div>
    <h1>Inventory</h1>
    <div>
      <datepicker
        input-class="input"
        :value="selectedDate"
        :format="convertToString"
      />
    </div>
    <div class="half view">
      <h3>View Inventory</h3>
      <div class="half">
        <inventory-times
          class="input"
          :inventory="availableInventory"
          @update-time="updateStartTime"
        />
      </div>
      <div class="half">
        <inventory-times
          class="input"
          :inventory="availableInventory"
          @update-time="updateEndTime"
        />
      </div>
      <div>
        <div v-if="inventory.length === 0">
          No inventory found for this date
        </div>
        <div v-else>
          <div class="text">
            Total Reservations: {{ totalReservations }} Openings:
            {{ totalAvailabilty }}
          </div>
          <table class="inventory">
            <thead>
              <tr>
                <th>Time</th>
                <th>Reservations/Max</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(inventory, index) in filteredInventory"
                v-bind:key="index"
              >
                <td>
                  {{ inventory | getReservationTime }}
                </td>
                <td>
                  {{ inventory.numberCreated }}/{{ inventory.maximumAvailable }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="half create">
      <h3>Create Inventory</h3>
      <div class="align-right">
        <span class="float-left">Number of Reservation to Accept:</span>
        <input
          class="input number"
          type="number"
          maxlength="2"
          v-model="reservation.maximumAvailable"
        />
      </div>
      <div class="align-right">
        <span class="float-left">Starting Time:</span>
        <available-times
          class="input"
          :first-reservation-time="firstReservationTime"
          :last-reservation-time="lastReservationTime"
          @update-time="updateCreateStartTime"
        />
      </div>
      <div class="align-right">
        <span class="float-left">Ending Time:</span>
        <available-times
          class="input"
          :first-reservation-time="firstReservationTime"
          :last-reservation-time="lastReservationTime"
          @update-time="updateCreateEndTime"
        />
      </div>
      <div>
        <button class="submit" @click="createInventory">
          Create Inventory
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * This page provides the ability to view and create reservation
 * slots (inventory) for customers
 */
import axios from 'axios'
import dayjs from 'dayjs'
import AvailableTimes from '../components/AvailableTimes.vue'
import InventoryTimes from '../components/InventoryTimes.vue'
import Datepicker from 'vuejs-datepicker'
import Vue from 'vue'
import { InventoryItem } from '../Interfaces'

import { DATE_TIME_FORMAT } from '../Constants'

export default Vue.extend({
  name: 'Inventory',

  computed: {
    // All available inventory for the given date.
    availableInventory() {
      return this.inventory
    },
    // Available inventory filtered by time.
    filteredInventory() {
      if (this.selectedStartTime !== '') {
        return this.inventory.filter((inventory: InventoryItem) => {
          let filteredInventory = null

          filteredInventory = this.filterByTime(
            inventory,
            this.firstReservationTime,
            this.lastReservationTime
          )

          return filteredInventory
        })
      }

      return this.inventory
    },
    inventoryTimes() {
      const reservationTimes = []

      const firstHour = parseInt(this.firstReservationTime.split(':')[0])
      const lastHour = parseInt(this.lastReservationTime.split(':')[0])
      const MINUTES = [0, 15, 30, 45]
      for (let hour = firstHour; hour < lastHour; hour++) {
        MINUTES.forEach(MINUTE => {
          reservationTimes.push(
            dayjs()
              .hour(hour)
              .minute(MINUTE)
              .format(DATE_TIME_FORMAT.TIME_FORMAT)
          )
        })
      }
      reservationTimes.push(
        dayjs()
          .hour(lastHour)
          .minute(MINUTES[0])
          .format(DATE_TIME_FORMAT.TIME_FORMAT)
      )
      return reservationTimes
    },
    // Used to filter available inventory.
    filterEndTime() {
      return this.formatDateTime(this.selectedEndTime)
    },
    // Used to filter available inventory.
    filterStartTime() {
      return this.formatDateTime(this.selectedStartTime)
    },
    // Date used to perform queries to the DB.
    queryDate() {
      return dayjs(this.selectedDate).format(DATE_TIME_FORMAT.QUERY_FORMAT)
    },
    // Calculates the total number of slots originally created for filtered times.
    totalAvailabilty() {
      let totalAvailabilty = 0

      if (this.filteredInventory.length > 0) {
        this.filteredInventory.forEach(reservation => {
          totalAvailabilty += reservation.maximumAvailable
        })
      }

      return totalAvailabilty
    },
    // Calculates the total reservations that have been placed.
    totalReservations() {
      let totalReservations = 0

      if (this.filteredInventory.length > 0) {
        this.filteredInventory.forEach(reservation => {
          totalReservations += reservation.numberCreated
        })
      }

      return totalReservations
    }
  },
  components: {
    AvailableTimes,
    InventoryTimes,
    Datepicker
  },
  filters: {
    getReservationDate(reservation) {
      return dayjs(reservation.date).format(DATE_TIME_FORMAT.MONTH_DAY_FORMAT)
    },
    getReservationTime(reservation) {
      return dayjs(reservation.date).format(DATE_TIME_FORMAT.TIME_FORMAT)
    }
  },
  data() {
    return {
      firstReservationTime: '10:00', // Arbitrary number should come from resturant preferences
      formattedEndDate: '',
      formattedStartDate: '',
      inventory: [],
      lastReservationTime: '23:00', // Arbitrary number should come from resturant preferences
      reservation: {
        date: '',
        maximumAvailable: 1,
        numberCreated: 0
      },
      selectedCreateEndTime: '',
      selectedCreateStartTime: '',
      selectedDate: dayjs().toDate(),
      selectedEndTime: '',
      selectedStartTime: ''
    }
  },
  methods: {
    // Used to present date to the user in a familiar format.
    convertToString(date: Date) {
      const dateString = dayjs(date).format(DATE_TIME_FORMAT.MONTH_DAY_FORMAT)
      Vue.set(this, 'selectedDate', dateString)
      return dateString
    },
    // Creates the inventory in the DB based on entered criteria.
    async createInventory() {
      const startIndex = this.inventoryTimes.indexOf(
        this.selectedCreateStartTime
      )
      const endIndex =
        this.inventoryTimes.indexOf(this.selectedCreateEndTime) + 1

      let times = this.inventoryTimes.slice(startIndex)

      if (endIndex <= this.inventoryTimes.length) {
        times = this.inventoryTimes.slice(startIndex, endIndex)
      }

      const reservations = []
      for (let i = 0; i < times.length; i++) {
        const dateTime = dayjs(this.selectedDate + ' ' + times[i])
        const reservation = {
          date: dayjs(dateTime).format(),
          maximumAvailable: this.reservation.maximumAvailable,
          numberCreated: 0
        }
        reservations.push(reservation)
      }

      try {
        await axios.post('http://localhost:9090/inventory', reservations)
        // Refresh the inventory after it's been created.
        Vue.set(this, 'inventory', await this.getInventory())
      } catch (error) {
        console.log(error.message)
      }
    },
    // Used in conjunction with the computed value.
    filterByTime(inventory: InventoryItem) {
      // Only filter if the start date has a value
      const reservationTime = inventory.date
      if (
        reservationTime >= this.filterStartTime &&
        reservationTime <= this.filterEndTime
      ) {
        return inventory
      }

      return null
    },
    // Formats the date to the format it'll be stored in.
    formatDateTime(time: string) {
      const dateTimeString = this.selectedDate + ' ' + time
      const dateTime = dayjs(dateTimeString).format(
        DATE_TIME_FORMAT.DATE_TIME_STRING
      )
      const formattedDateTime = dayjs(dateTime).format()
      return formattedDateTime
    },
    // Fetches inventory from the DB.
    async getInventory() {
      try {
        const inventoryResponse = await axios.get(
          `http://localhost:9090/inventory?date=${this.queryDate}`
        )
        return inventoryResponse.data
      } catch (error) {
        // TODO: Log the error for reference.
        console.error(error)
      }
    },
    updateCreateEndTime(endTime: string) {
      const dateTimeString = this.selectedDate + ' ' + endTime
      Vue.set(
        this,
        'selectedCreateEndTime',
        dayjs(dateTimeString).format(DATE_TIME_FORMAT.TIME_FORMAT)
      )
    },
    updateCreateStartTime(startTime: string) {
      const dateTimeString = this.selectedDate + ' ' + startTime
      Vue.set(
        this,
        'selectedCreateStartTime',
        dayjs(dateTimeString).format(DATE_TIME_FORMAT.TIME_FORMAT)
      )
    },
    updateEndTime(endTime: { id: number; time: string }) {
      const dateTimeString = this.selectedDate + ' ' + endTime.time
      Vue.set(
        this,
        'selectedEndTime',
        dayjs(dateTimeString).format(DATE_TIME_FORMAT.TIME_FORMAT)
      )
    },
    updateStartTime(startTime: { id: number; time: string }) {
      const dateTimeString = this.selectedDate + ' ' + startTime.time
      Vue.set(
        this,
        'selectedStartTime',
        dayjs(dateTimeString).format(DATE_TIME_FORMAT.TIME_FORMAT)
      )
    }
  },
  watch: {
    /**
     * Since data is dependent on the selected day, watch that field
     * and fetch data based on the changing of its value.
     */
    async selectedDate() {
      // We use the reservation to create inventory so keep it in sync.
      Vue.set(this.reservation, 'date', this.selectedDate)
      Vue.set(this, 'inventory', await this.getInventory())
    }
  }
})
</script>

<style lang="scss" scoped>
.number {
  width: 2rem;
}

.text {
  min-height: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

table {
  &.inventory {
    width: 100%;
  }
}
</style>
