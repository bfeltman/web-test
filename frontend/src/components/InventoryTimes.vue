<template>
  <select v-model="selectedInventory" @change="emitTime(selectedInventory)">
    <option disabled value="">Please Select Time</option>
    <option
      v-for="time in availableInventory"
      :value="time"
      v-bind:key="time.id"
    >
      {{ time.time }}
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
    inventory: {
      required: false,
      default: () => {
        return []
      }
    }
  },
  computed: {
    availableInventory() {
      const availableInventory = []

      if (this.inventory.length > 0) {
        this.inventory.forEach(inventory => {
          const availableTime = {
            id: inventory.id,
            time: dayjs(inventory.date).format(DATE_TIME_FORMAT.TIME_FORMAT)
          }
          availableInventory.push(availableTime)
        })
      }
      return availableInventory
    }
  },
  data() {
    return {
      selectedInventory: ''
    }
  },
  methods: {
    emitTime(selectedInventory: { id: number; time: string }) {
      this.$emit('update-time', selectedInventory)
    }
  }
})
</script>
