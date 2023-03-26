<template>
  <q-page style="background-color: #1f2227">
    <q-splitter v-model="splitterModel" class="splitter">
      <template v-slot:before>
        <q-toolbar class="text-white shadow-2" style="background-color: #1f2227">
          <q-btn class="q-px-md" size="sm" outline color="white" :icon="selectedTemplate ? (selectedTemplate.type == 'template' ? 'article' : 'mediation') : 'help'"
            ><span class="q-px-md">{{ selectedTemplate ? selectedTemplate.name : 'Select template' }}</span>
            <q-menu>
              <q-list v-if="templates" style="min-width: 200px">
                <q-item v-for="(v, k) in templates" :key="k" clickable v-close-popup @click="selectTemplate(v)">
                  <q-item-section
                    ><div class="row"><q-icon class="q-mr-md" :name="v.type == 'template' ? 'article' : 'mediation'" />{{ v.name }}</div></q-item-section
                  >
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn class="q-ml-md q-px-md" size="sm" outline color="white" icon="save" @click="save"><span class="q-px-md">save</span></q-btn>
          <q-space />
          <q-btn class="q-px-md" size="sm" outline color="white" :label="lang != '' ? lang : 'En'">
            <LangSelectorMenu v-model="lang" />
          </q-btn>
        </q-toolbar>
        <div v-if="selectedTemplate" class="fit container">
          <MonacoEditor ref="editor" v-model="code" :templateType="selectedTemplate.type" :selectedTemplate="selectedTemplate" />
        </div>
      </template>

      <template v-slot:after>
        <q-toolbar class="text-white shadow-2" style="background-color: #1f2227">
          <q-space />
          <q-btn class="q-ml-md" size="md" flat round icon="desktop_mac" @click="iframeWidth = '100%'"></q-btn>
          <q-btn class="q-ml-md" size="md" flat round icon="tablet_mac" @click="iframeWidth = '767px'"></q-btn>
          <q-btn class="q-ml-md" size="md" flat round icon="smartphone" @click="iframeWidth = '479px'"></q-btn>
          <span class="q-ml-md text-bold">{{ iframeWidth }}</span>
          <q-space />
        </q-toolbar>
        <div class="row fit preview justify-center">
          <iframe ref="render" :width="iframeWidth" height="100%" frameborder="0"> </iframe>
        </div>
      </template>
    </q-splitter>

    <q-dialog v-model="dialogVars" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm text-h5">Test Inserted Vars</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="row items-center">
          <q-list v-if="varsErrors">
            <q-item v-for="(v, k) in varsErrors" :key="k" clickable v-close-popup>
              <q-item-section>
                <div class="row items-center">
                  <span class="q-mr-md" :style="{ color: v ? 'green' : 'red' }"
                    ><b>{{ k }}</b></span
                  >
                  <q-icon name="done" :color="v ? 'green' : 'red'" style="font-size: 1.5rem" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div class="q-mt-md fit row justify-center">
            <b>Some variables are not inserted!</b>
          </div>
          <div class="q-mt-md fit row justify-center">
            <b>Please correct before save template</b>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style lang="scss" scoped>
.splitter {
  height: calc(100vh - 50px);
  .q-splitter__panel {
    overflow: hidden !important;
    .container {
      overflow: hidden !important;
      max-height: calc(100vh - 100px);
    }
    .preview {
      overflow: hidden !important;
      max-height: calc(100vh - 100px);
    }
  }
}
</style>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted, provide, watch } from 'vue';
import MonacoEditor from 'components/MonacoEditor/Editor.vue';
import { useAuthStore } from 'src/stores/auth';
import { MjmlTemplate, SaveTempateForm, TempateForm, TemplatesMjml } from 'src/api/imported';
import LangSelectorMenu from 'src/components/User/LangSelectorMenu.vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'PageTransactionalMails',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { MonacoEditor, LangSelectorMenu },
  setup() {
    const $q = useQuasar();
    const auth = useAuthStore();
    const render = ref<HTMLIFrameElement>();
    let window: Window | null;
    const editor = ref(null);
    const templates = ref<unknown>({});
    const templatesOptions = ref<string[]>();
    const selectedTemplate = ref<MjmlTemplate>();
    const html = ref('');
    const code = ref('');
    const preview = ref(false);
    const dialogVars = ref(false);
    const varsError = ref(false);
    const varsErrors = ref<{ [key: string]: boolean }>({});
    const iframeWidth = ref('100%');
    const lang = ref('En');

    const renderHtml = (html: string) => {
      if (window) {
        window.document.open();
        window.document.write(html || '');
        window.document.close();
      }
    };
    provide('renderHtml', renderHtml);

    watch(
      () => lang.value,
      () => {
        if (selectedTemplate.value) {
          code.value = 'loading...';
          setTimeout(async () => {
            if (selectedTemplate.value) await selectTemplate(selectedTemplate.value);
          }, 1000);
        }
      }
    );

    onMounted(async () => {
      const { data, error } = await TemplatesMjml.AllTemplates();
      if (!error) {
        templates.value = data.templates;
        templatesOptions.value = Object.keys(data.templates);
      }
      if (render.value) {
        window = render.value.contentWindow;

        if (window) {
          window.document.open();
          window.document.write(html.value || '');
          window.document.close();
        }
      }
    });

    const selectTemplate = async (selected: MjmlTemplate) => {
      const template = <TempateForm>{ lang: lang.value, name: selected.name };
      selectedTemplate.value = selected;
      const { data, error } = await TemplatesMjml.GetTransctionalMail(template);
      if (!error) {
        code.value = data.template;
      }
    };

    const save = async () => {
      if (!selectedTemplate.value) {
        return;
      }
      if (editor.value) {
        const html = (
          editor.value as unknown as {
            getValue: () => string;
          }
        ).getValue();

        const test = (
          editor.value as unknown as {
            testVars: () => {
              error: boolean;
              vars: { [key: string]: boolean };
            };
          }
        ).testVars();

        varsError.value = false;
        varsErrors.value = {};
        if (test.error) {
          varsError.value = test.error;
          varsErrors.value = test.vars;
          dialogVars.value = true;
          return;
        }
        const form = <SaveTempateForm>{};
        form.name = selectedTemplate.value.name;
        form.lang = lang.value;
        form.mjml = html;
        form.type = selectedTemplate.value.type;

        const { error } = await TemplatesMjml.SaveTransctionalMail(form);
        if (!error) {
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: `template ${selectedTemplate.value} saved sucessfully`,
            position: 'top-right',
            timeout: 3000,
          });
        } else {
          $q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'thumb_down_off_alt',
            message: `template ${selectedTemplate.value} save error`,
            position: 'top-right',
            timeout: 3000,
          });
        }
      }
    };

    return {
      iframeWidth,
      preview,
      varsErrors,
      varsError,
      dialogVars,
      editor,
      splitterModel: ref(50), // start at 50%,
      code,
      render,
      auth,
      lang,
      templates,
      templatesOptions,
      selectedTemplate,
      selectTemplate,
      save,
    };
  },
});
</script>
