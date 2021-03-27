<template>
  <div>
    <h1>Reservations</h1>
    <div>
      <div class="inputContainer">
        <label for="partyName">Party Name</label>
        <input
          id="partyName"
          type="text"
          class="input"
          v-model.trim="reservation.partyName"
        />
      </div>

      <div class="inputContainer">
        <label for="emailAddress">Email Address</label>
        <input
          id="emailAddress"
          type="text"
          class="input"
          v-model.trim="reservation.emailAddress"
        />
      </div>

      <div class="inputContainer">
        <label for="partySize">Party Size</label>
        <select id="partySize" class="input" v-model="reservation.partySize">
          <option disabled value="">Select Party Size</option>
          <option v-for="partySize in partySizes" v-bind:key="partySize">
            {{ partySize }}
          </option>
          <option>{{ maximumPartySize }}+</option>
        </select>
      </div>

      <div class="inputContainer">
        <label for="reservationDate">Reservation Date</label>
        <datepicker
          id="reservationDate"
          input-class="input"
          :value="selectedDate"
          :format="convertToString"
        />
      </div>

      <div class="inputContainer">
        <label for="reservationTime">Reservation Time</label>
        <inventory-times
          id="reservationTime"
          class="input"
          :inventory="availableInventory"
          @update-time="updateSelectedTime"
        />
      </div>
    </div>

    <div class="text" v-if="inventory.length === 0">
      No reservations available for this date
    </div>

    <div v-else>
      <div class="text confirmation">
        <div v-show="reservation.partyName" transition="fade">
          New Reservation for: {{ reservation.partyName }}<br />
          Party of {{ reservation.partySize }} on
          {{ reservation | getReservationDate }} at {{ selectedTime }}
        </div>
      </div>

      <div :class="validation.success ? 'success' : 'error'">
        {{ validation.message }}
      </div>

      <div>
        <button class="submit reservations" @click="saveReservation">
          Save Reservation
        </button>
      </div>
    </div>

    <div v-if="reservations.length > 0">
      <h3>Today's Reservations</h3>
      <table class="reservations">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Party Name</th>
            <th>Party Size</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in reservations" v-bind:key="reservation.id">
            <td>{{ reservation | getReservationDate }}</td>
            <td>{{ reservation | getReservationTime }}</td>
            <td>{{ reservation.partyName }}</td>
            <td>{{ reservation.partySize }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * This page allows for the scheduling and viewing of upcoming
 * Reservations on the selected day.
 */
import axios from 'axios'
import dayjs from 'dayjs'
import InventoryTimes from '../components/InventoryTimes.vue'
import Datepicker from 'vuejs-datepicker'
import Vue from 'vue'

import { DATE_TIME_FORMAT } from '../Constants'

export default Vue.extend({
  name: 'Reservations',

  computed: {
    // All available inventory for the selected date.
    availableInventory() {
      return this.inventory
    },
    // Used to get the make DB queries for this date.
    queryDate() {
      return dayjs(this.selectedDate).format(DATE_TIME_FORMAT.QUERY_FORMAT)
    },
    // Used to make reservations so keep it in sync with the UI.
    reservationDate() {
      const dateString = this.selectedDate + ' ' + this.selectedTime
      const dateTime = dayjs(dateString).format(
        DATE_TIME_FORMAT.DATE_TIME_STRING
      )
      const formattedDate = dayjs(dateTime).format()
      Vue.set(this.reservation, 'date', formattedDate)
      return formattedDate
    }
  },
  components: {
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
      inventory: [],
      lastReservationTime: '23:00', // Arbitrary number should come from resturant preferences
      maximumPartySize: 25, // Arbitrary number should come from resturant preferences
      partySizes: [],
      reservation: {
        date: '',
        emailAddress: '',
        partyName: '',
        partySize: 4
      },
      reservations: [],
      selectedInventoryId: null,
      selectedDate: dayjs().toDate(),
      selectedTime: '',
      validation: {}
    }
  },

  async created() {
    Vue.set(this, 'partySizes', this.getPartySizes())
  },

  methods: {
    // Present the date to the user in a familiar format.
    convertToString(date) {
      const dateString = dayjs(date).format(DATE_TIME_FORMAT.MONTH_DAY_FORMAT)
      Vue.set(this, 'selectedDate', dateString)
      return dateString
    },
    async getInventory() {
      try {
        const inventoryResponse = await axios.get(
          `http://localhost:9090/inventory/available?date=${this.queryDate}`
        )
        return inventoryResponse.data
      } catch (error) {
        // TODO: Log the error for reference.
        console.error(error)
      }
    },
    /**
     * Sets up the party sizes list.  Should be configurable
     * per resturant.
     */
    getPartySizes() {
      const partySizes = []
      for (let i = 1; i < this.maximumPartySize; i++) {
        partySizes.push(i)
      }
      return partySizes
    },
    async getReservations() {
      try {
        const reservationsResponse = await axios.get(
          `http://localhost:9090/reservations?date=${this.queryDate}`
        )
        return reservationsResponse.data
      } catch (error) {
        // TODO (brandon): Log the error for reference.
        console.error(error)
      }
    },
    // Sets the reservation data to the 'default' state.
    initializeForm() {
      Vue.set(this, 'reservation', {
        date: '',
        emailAddress: '',
        partyName: '',
        partySize: 4
      })
      Vue.set(this, 'selectedTime', '')
    },
    async saveReservation() {
      try {
        this.validateForm()
        if (this.validation.success) {
          // Save the reservation to the DB.
          await axios.post(
            'http://localhost:9090/reservations',
            this.reservation
          )
          // Update the inventory to consume the available slot.
          await axios.put(
            `http://localhost:9090/inventory?id=${this.selectedInventoryId}`
          )
          this.initializeForm()
          // Reset the validation for the next reservation.
          Vue.set(this, 'validation', {})
          // Get the new data and refelect it in the UI.
          Vue.set(this, 'inventory', await this.getInventory())
          Vue.set(this, 'reservations', await this.getReservations())
        }
      } catch (error) {
        Vue.set(this, 'validation', { success: false, message: error.message })
      }
    },
    // If the user changes the time it's tied to inventory so keep them in sync.
    updateSelectedTime(selectedInventory) {
      Vue.set(this, 'selectedInventoryId', selectedInventory.id)
      Vue.set(this, 'selectedTime', selectedInventory.time)
    },
    // Validates the field prior to submission.
    validateForm() {
      if (this.reservation.date === null) {
        // TODO: Enhance this so that reservations may not be made in the past.
        Vue.set(this, 'validation', {
          success: false,
          message: 'Please enter a reservation date'
        })
        return
      } else if (this.reservation.partyName === '') {
        Vue.set(this, 'validation', {
          success: false,
          message: 'Please enter a party name'
        })
        return
      } else if (this.reservation.emailAddress === '') {
        // TODO: Add more strict checking on a valid email address.
        Vue.set(this, 'validation', {
          success: false,
          message: 'Please enter an email address'
        })
        return
      } else if (this.selectedtime === '') {
        Vue.set(this, 'validation', {
          success: false,
          message: 'Please select a reservation time'
        })
      } else {
        Vue.set(this, 'validation', {
          success: true,
          message: 'Reservation Saved'
        })
      }
    }
  },
  watch: {
    /**
     * Since data is dependent on the selected day, watch that field
     * and fetch data based on the changing of its value.
     */
    async selectedDate() {
      Vue.set(this, 'reservations', await this.getReservations())
      Vue.set(this, 'inventory', await this.getInventory())
    }
  }
})
</script>

<style lang="scss" scoped>
// Not using a CSS library on purpose but I'm competent with
// MaterialUI, Foundation and Bootstrap
@import './styles/_colors.scss';

.error,
.success {
  height: 2.4rem;
}

.error {
  color: $red;
}

.inputContainer {
  display: inline-block;
}

.success {
  color: $green;
}

.text {
  min-height: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;

  &.confirmation {
    min-height: 8.4rem;
  }
}

table {
  &.reservations {
    margin-left: 20%;
    width: 60%;
  }
}
</style>
