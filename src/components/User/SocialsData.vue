<template>
  <div class="column">
    <div class="text-h6">{{ $t('profile.socials.title') }}</div>
    <q-separator />
    <q-form
      class="q-gutter-md"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
    >
      <div class="row q-py-sm">
        <q-btn
          v-if="!onEdit"
          class="q-mr-sm"
          dense
          style="min-width: 60px;"
          color="primary"
          icon="edit"
          @click="
            onEdit = !onEdit;
            start();
          "
          ><span class="q-mx-sm">{{ $t('profile.socials.edit') }}</span></q-btn
        >
        <q-btn
          v-if="onEdit"
          dense
          style="min-width: 60px;"
          color="primary"
          icon="save"
          @click="onSave"
          ><span class="q-mx-sm">{{ $t('profile.socials.save') }}</span></q-btn
        >

        <q-btn
          class="q-ml-md"
          v-if="onEdit"
          dense
          flat
          style="min-width: 60px;"
          color="primary"
          @click="reset()"
          ><span class="q-mx-sm">{{ $t('profile.socials.reset') }}</span></q-btn
        >
      </div>

      <div class="row items-center q-pa-sm" v-for="(v, k) in socials" :key="k">
        <div class="row items-start col-12">
          <q-icon><img class="social-icon" :src="`/icons/${v.icon}`" /></q-icon>
          <span class="q-mx-md">{{ v.label }}</span>
        </div>
        <div class="col-12 socials-mask">
          <q-input
            :ref="(el) => setItemRef(el)"
            bottom-slots
            type="text"
            v-model="socials[k].address"
            :disable="!onEdit"
          >
            <template v-slot:hint
              ><span class="mask text-blue-grey-7">{{
                `${v.addressMask}${socials[k].address}`
              }}</span></template
            >
          </q-input>
        </div>
      </div>
    </q-form>
  </div>
</template>

<style lang="sass" scoped>
.social-icon
  height: 32px
  width: 32px
.socials-mask
  .mask
    font-size: 14px
    font-weight: bold
    color: black
.q-if-label
  transform: translateY(-60%) scale(0.85)!important
  font-weight: bold!important
</style>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted, onBeforeUpdate, PropType } from 'vue';
import { QForm, QInput, useQuasar } from 'quasar';
import { Admin, Socials, User, Users, UserSocialsForm } from 'src/api/imported';
import { useAuthStore } from 'stores/auth';
import { useI18n } from 'vue-i18n';

export const socialsDefinitions: Socials = {
  soundcloud: {
    icon: 'soundcloud.svg',
    label: 'SoundClaud',
    addressMask: 'https://soundcloud.com/',
    address: '',
  },
  linkedin: {
    icon: 'linkedin.svg',
    label: 'Linkedin',
    addressMask: 'https://www.linkedin.com/in/',
    address: '',
  },
  facebook: {
    icon: 'facebook.svg',
    label: 'Facebook',
    addressMask: '',
    address: '',
  },
  twitter: {
    icon: 'twitter.svg',
    label: 'Twitter',
    addressMask: '',
    address: '',
  },
  youtube: {
    icon: 'youtube.svg',
    label: 'Youtube',
    addressMask: '',
    address: '',
  },
};

export default defineComponent({
  name: 'SocialsData',
  components: { QForm },
  props: {
    userRow: {
      type: Object as PropType<User>,
      required: false,
      default: null,
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const $q = useQuasar();
    const showError = ref<boolean>(false);
    const first = ref<QInput | null>();
    const onEdit = ref(false);
    const userData = ref<User>(<User>{});
    const auth = useAuthStore();
    const socials = ref<Socials>({});

    const setItemRef = (el: QInput) => {
      if (el && !first.value) {
        first.value = el;
      }
    };

    onBeforeUpdate(() => {
      first.value = null;
    });

    onMounted(() => {
      if (!props.userRow) {
        userData.value = auth.user as User;
      } else {
        userData.value = props.userRow;
      }
      reset();
    });

    const reset = () => {
      let s = <Socials>{};
      try {
        s = JSON.parse(userData.value.socials);
      } catch (error) {
        console.log(error);
      }
      for (const i in socialsDefinitions) {
        if (s.hasOwnProperty(i)) {
          socials.value[i] = s[i];
        } else {
          socials.value[i] = socialsDefinitions[i];
        }
      }
      onEdit.value = false;
    };

    const onSave = async () => {
      const socialsData = <UserSocialsForm>{
        uuid: '',
        socials: JSON.stringify(socials.value),
      };

      if (auth.user?.uuid !== props.userRow.uuid) {
        socialsData.uuid = props.userRow.uuid;
        const { data, error } = await Admin.UpdateUserSocials(socialsData);

        if (!error) {
          emit('update', data);
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: t('profile.socials.updatesuccessfully'),
            position: 'top-right',
            timeout: 3000,
          });
          onEdit.value = false;
          await auth.get();
        } else {
          $q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'thumb_down_off_alt',
            message: t('profile.socials.updateerror'),
            position: 'top-right',
            timeout: 3000,
          });
        }
      }

      if (auth.user?.uuid == props.userRow.uuid) {
        const { data, error } = await Users.UpdateSocials(socialsData);
        if (!error) {
          emit('update', data);
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: t('profile.socials.updatesuccessfully'),
            position: 'top-right',
            timeout: 3000,
          });
          onEdit.value = false;
          await auth.get();
        } else {
          $q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'thumb_down_off_alt',
            message: t('profile.socials.updateerror'),
            position: 'top-right',
            timeout: 3000,
          });
        }
      }
    };

    return {
      first,
      userData,
      showError,
      socials,
      onEdit,
      reset,
      onSave,
      setItemRef,
      start() {
        setTimeout(() => {
          console.log();
          (first.value as QInput)?.focus();
        }, 20);
      },
    };
  },
});
</script>
