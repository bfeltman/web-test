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
 *
 * Interview Note: Creating this as a class component just for demonstration
 * purposes.
 */
import dayjs from 'dayjs'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { DATE_TIME_FORMAT } from '../Constants'

@Component({})
export default class AvailableTimes extends Vue {
  @Prop()
  firstReservationTime: string

  @Prop()
  lastReservationTime: string

  mounted() {
    Vue.set(this, 'availableTimes', this.getAvailableReservationTimes())
  }

  availableTimes: string[] = []
  selectedTime = ''

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
  }

  emitTime(selectedInventory) {
    this.$emit('update-time', selectedInventory)
  }

  @Watch('availableTimes')
  setSelectedTime() {
    Vue.set(this, 'selectedTime', '')
  }
}
</script>

<style lang="scss" scoped>
select {
  font-size: 1.4rem;
  outline: none;
  padding: 0.6rem 1.4rem;
}
</style>
