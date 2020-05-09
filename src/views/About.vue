<template>
  <div class="about">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script type="text/babel">
export default {
  name: 'Ablout',

  data() {
    return {
      msg: 'hello webpack',
    };
  },

  methods: {
    close() {
      this.msg = 'hello';
    },
  },
};
</script>
