<template>
  <q-dialog v-model="openImages" @hide="hide" @before-show="beforeShow">
    <q-card class="my-card" style="min-width: 450px">
      <q-card-section>
        <div class="row justify-between items-center">
          <div>
            <div class="text-h6">{{ $t('images.edit') }}</div>
          </div>
          <q-space />
          <div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-md">
        <div v-if="!images.length" class="row justify-center">
          {{ $t('images.noimages') }}
        </div>

        <draggable
          class="draggable-list"
          :list="images"
          item-key="uuid"
          @start="dragging = true"
          @end="
            dragging = false;
            endDragging();
          "
        >
          <template #item="{ element }">
            <q-item class="{dragging}">
              <q-item-section thumbnail>
                <img class="q-ml-sm" :src="`${site}/assets//images/${element.uuid}?${new Date().getTime()}`" style="height: auto" />
              </q-item-section>
              <q-item-section>
                <q-item-label overline
                  ><b>{{ $t(`ad.img-${element.category}`) }}</b></q-item-label
                >
                <q-item-label caption><span style="font-size: 77%" v-html="element.description" /></q-item-label>
              </q-item-section>
              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn class="gt-xs" size="12px" flat dense round icon="delete" @click="deleteImage(element.uuid)" />
                  <q-btn class="gt-xs" size="12px" flat dense round icon="edit" @click="editImage(element)" />
                </div>
              </q-item-section>
            </q-item>
          </template>
        </draggable>
      </q-card-section>
      <q-separator />
      <q-card-actions class="q-pr-sm" align="right">
        <q-btn class="q-mr-sm q-mb-sm" color="primary" icon="add" @click="addImage">{{ $t('add-immage') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- <AdvImageDialog ref="imageDialog" v-model="openImageDialog" :image="image" @save="saveImage" @save:details="saveDetails" />-->
</template>

<style>
.sortable-ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import { backend,  Images, Image} from 'src/api/imported';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import draggable from 'vuedraggable';

export default defineComponent({
  name: 'ImagesDialog',

  components: {
    draggable,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    uuid: {
      type: String as PropType<string>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'saved', 'deleted'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const { t } = useI18n();
    const openImageDialog = ref(false);
    const images = ref<Image[]>([]);
    const image = ref();
    const _uuid = ref(props.uuid);
    const imageDialog = ref();

    const dragging = ref(false);
    const site = ref(backend);

    const openImages = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const openDialog = async () => {
      _uuid.value = props.uuid;
      // images.value = adForm.images;
    };

    const addImage = () => {
      openImageDialog.value = true;
      imageDialog.value.addImage();
    };

    const editImage = (img: Image) => {
      image.value = `${img.uuid}`;
      imageDialog.value.setImage(img);
      openImageDialog.value = true;
    };

    const hide = () => {
      openImages.value = false;
    };

    const beforeShow = () => {
      openDialog();
    };

    const findImage = (uuid: string): Image | null => {
      let found = null;
      images.value.forEach((img) => {
        if (img.uuid == uuid) {
          found = img;
        }
      });
      return found;
    };

    const saveImage = async (uuid: string, category: string, description: string) => {
      console.log(findImage(uuid));
      const { error, data } = await Images.AddImage({
        uuid: uuid,
        category: category,
        description: description,
      });
      if (!error) {
        emit('saved', data, category, description);
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'thumb_up_off_alt',
          message: t('ad.image-updatesuccess'),
          position: 'top-right',
          timeout: 3000,
        });
        openImageDialog.value = false;
      } else {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: t('ad.image-updateerror'),
          position: 'top-right',
          timeout: 3000,
        });
      }
    };

    const saveDetails = async (uuid: string, category: string, description: string) => {
      const { error, data } = await Images.UpdateImageDetails({
        uuid: uuid,
        category: category,
        description: description,
      });
      if (!error) {
        emit('saved', data, category, description);
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'thumb_up_off_alt',
          message: t('ad.image-updatesuccess'),
          position: 'top-right',
          timeout: 3000,
        });
        openImageDialog.value = false;
      } else {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: t('ad.image-updateerror'),
          position: 'top-right',
          timeout: 3000,
        });
      }
    };

    const deleteImage = async (uuid: string) => {
      const { error } = await Images.RemoveImage({
        imageUUID: uuid,
      });
      if (!error) {
        emit('deleted', uuid);
        openImageDialog.value = false;
      }
    };

    const endDragging = async () => {
     /*  const list = <ImagesOrder>{};
      list.order = <ImagesOrder[]>[];
      (list.announcementUUID = _uuid.value || ''),
        images.value.forEach((img, index) => {
          const a = img.uuid.split('?');
          list.order.push({ UUID: a[0], order: index });
        });

      const { data, error } = await Images.UpdateImagesOrderHandler(list);
      if (!error) {
        // adv.order(data);
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'thumb_up_off_alt',
          message: t('ad.image-order-updatesuccess'),
          position: 'top-right',
          timeout: 3000,
        });
      } else {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: t('ad.image-order-updateerror'),
          position: 'top-right',
          timeout: 3000,
        });
      }
 */
      //UpdateImagesOrder
    };

    return {
      openImages,
      imageDialog,
      openImageDialog,
      saveImage,
      saveDetails,
      deleteImage,
      editImage,
      addImage,
      images,
      image,
      hide,
      beforeShow,
      site,
      dragging,
      endDragging,
    };
  },
});
</script>
