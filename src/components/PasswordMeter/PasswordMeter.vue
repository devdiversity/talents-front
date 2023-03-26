<template>
  <div class="po-password-strength-bar" :class="passwordClass">
    <div class="strength">
      <span v-if="strength">{{ $t(strength) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { checkStrength, scorePassword } from './index';

export default defineComponent({
  name: 'PasswordMeter',
  props: {
    password: String,
  },
  emits: ['score'],
  computed: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    passwordClass(): object | null {
      if (!this.password) {
        return null;
      }
      const strength = checkStrength(this.password).split('.')[1] || '';
      const score = scorePassword(this.password);
      this.$emit('score', { score, strength });
      return {
        [strength]: true,
        scored: true,
      };
    },
    strength(): string {
      if (!this.password || this.password.length === 0) return '';
      if (this.password && this.password.length < 6)
        return 'login.password.tooshort';
      return 'login.' + checkStrength(this.password || '');
    },
  },
});
</script>

<style>
.po-password-strength-bar {
  border-radius: 2px;
  transition: all 0.2s linear;
  height: 15px;
  margin-top: 5px;
}
.po-password-strength-bar.risky {
  background-color: #f95e68;
}
.po-password-strength-bar.risky .strength {
  color: #ffffff;
}
.po-password-strength-bar.guessable {
  background-color: #fb964d;
}
.po-password-strength-bar.guessable .strength {
  color: #ffffff;
}
.po-password-strength-bar.weak {
  background-color: #fdd244;
}
.po-password-strength-bar.weak .strength {
  color: #000000;
}
.po-password-strength-bar.safe {
  background-color: #b0dc53;
}
.po-password-strength-bar.safe .strength {
  color: #000000;
}
.po-password-strength-bar.secure {
  background-color: #35cc62;
}
.po-password-strength-bar.secure .strength {
  color: #000000;
}
.strength {
  font-size: 80%;
  font-weight: bold;
  text-transform: uppercase;
  padding-left: 5px;
  margin-top: -2px;
}
</style>
