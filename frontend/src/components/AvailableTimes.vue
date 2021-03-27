<template>
  <select v-model="selectedTime" @change="emitTime(selectedTime)">
    <option disabled value="">Please Select Time</option>
    <option v-for="time in availableTimes" v-bind:key="time">
      {{ time }}
    </option>
  </select>
</template>

<script lang="ts">
/**
 * This component accepts an array of objects to be used
 * as a time picker.  In this context the list can be
 * all available inventory slots or a list of all available
 * times.
 */
import dayjs from 'dayjs'
import Vue from 'vue'

import { DATE_TIME_FORMAT } from '../Constants'

export default Vue.extend({
  props: {
    firstReservationTime: {
      required: true
    },
    lastReservationTime: {
      required: false
    }
  },
  mounted() {
    Vue.set(this, 'availableTimes', this.getAvailableReservationTimes())
  },
  data() {
    return {
      availableTimes: [],
      selectedTime: ''
    }
  },
  methods: {
    getAvailableReservationTimes() {
      const reservationTimes = []
      const firstHour = parseInt(this.firstReservationTime.split(':')[0])
      const lastHour = parseInt(this.lastReservationTime.split(':')[0])
      const intervals = [0, 15, 30, 45]

      for (let hour = firstHour; hour < lastHour; hour++) {
        intervals.forEach(interval => {
          reservationTimes.push(
            dayjs()
              .hour(hour)
              .minute(interval)
              .format(DATE_TIME_FORMAT.TIME_FORMAT)
          )
        })
      }
      reservationTimes.push(
        dayjs()
          .hour(lastHour)
          .minute(0)
          .format(DATE_TIME_FORMAT.TIME_FORMAT)
      )
      return reservationTimes
    },
    emitTime(selectedInventory) {
      this.$emit('update-time', selectedInventory)
    }
  }
})
</script>

<style lang="scss" scoped>
select {
  font-size: 1.4rem;
  outline: none;
  padding: 0.6rem 1.4rem;
}
</style>
