<template>
  <div id="app">
    <div id="nav">
      <router-link to="/reservations">Reservations</router-link> |
      <router-link to="/inventory">Inventory</router-link>
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
@import './styles/_colors.scss';
@import './styles/_buttons.scss';
@import './styles/_datepicker.scss';
@import './styles/_input.scss';
@import './styles/_layout.scss';
@import './styles/_tables.scss';

html {
  font-size: 10px;
}

body {
  font-size: 1.6rem;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
