<template>
  <q-table
    v-if="ready && schema"
    ref="datatable"
    class="row full-width fill sticky-table"
    title="Treats"
    :rows="filteredData"
    :columns="schema.columns"
    row-key="index"
    virtual-scroll
    v-model:pagination="pagination"
    :rows-per-page-options="[0]"
    :visible-columns="visibleColumns"
  >
    <!-- NO DATA -->
    <template v-slot:no-data="{ icon, message, filter }">
      <div class="full-width row flex-center text-accent q-gutter-sm">
        <q-icon size="2em" name="sentiment_dissatisfied" />
        <span> Well this is sad... {{ message }} </span>
        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
      </div>
    </template>
    <!-- TOP -->
    <template v-slot:top>
      <span class="text-h5">
        {{ schema.title }}
      </span>
      <div v-if="schema.headerLeft">
        <component :is="schema.headerLeft.component" :componentConfig="schema.headerLeft.componentConfig" @action="action" />
      </div>
      <q-space />
      <div v-if="schema.headerRight">
        <component :is="schema.headerRight.component" :componentConfig="schema.headerRight.componentConfig" @action="action" />
      </div>
      <div v-if="schema.headerConfig">
        <component :is="schema.headerConfig.component" :data="schema" @action="action" />
      </div>
    </template>
    <!-- HEADER -->
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props" :width="`${col.width}px`">
          <div class="columns" :style="{ width: `${col.width}px` }">
            <div class="row th-top no-wrap justify-between items-center" @click="doSort(col.name)">
              <div class="ellipsis" v-if="col.label && col.label !== ''">
                {{ $t(`table_${name}.column.${col.name.toLowerCase()}`) }}
              </div>
              <div style="min-width: 22px;">
                <i class="notranslate material-icons q-icon q-table__sort-icon q-table__sort-icon--left" aria-hidden="true" role="presentation">arrow_upward</i>
              </div>
            </div>
            <div v-if="col.search" class="row q-mt-xs">
              <component :is="col.search.component" :data="col.field" :rawData="data" :componentConfig="col.search.componentConfig || {}" @search="doSearch" />
            </div>
          </div>
        </q-th>
      </q-tr>
    </template>
    <!-- BODY -->

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="v in props.cols" :key="v.id" style="overflow: hidden;" :width="`${v.width}px`">
          <div class="td-component row col" v-if="v.component">
            <component :is="v.component" :dense="dense" :row="props.row" :data="v.value" :componentConfig="v.componentConfig" @action="action" />
          </div>
          <div
            v-else
            class="td-container"
            :style="{
              width: `${v.width ? `${v.width}px` : '100%'}`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }"
            v-html="v.value"
          ></div>
        </q-td>
      </q-tr>
    </template>

    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>
  </q-table>
</template>

<style lang="sass">
.sticky-table
  /* height or max-height is important */
  height: 100%
  /* specifying max-width so the example can highlight the sticky column on any browser window */
  // max-width: 600px

  table
    border-bottom: 1px solid #ccc

  td:first-child
    /* bg color is important for td; just specify one */
    padding-left: 8px!important
    background: #fff

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #fff


  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
    border-bottom: 2px solid #ccc

  thead th:last-child
    padding-right: 8px!important

  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0
    border-right: 2px solid #ccc


  td:nth-child(2), th:nth-child(2)
    border-left: none
    background: #fff

  thead th
    .th-top:hover
      cursor: pointer
      i
        opacity:88

  .td-container
    b
      color: var(--q-primary)
</style>

<script lang="ts">
import TableRoles from './components/Roles.vue';
import TableDate from './components/Date.vue';
import TableStatus from './components/Status.vue';
import TableActive from './components/Active.vue';
import TableImages from './components/Images.vue';
import TableMenu from './components/Menu.vue';
import TableHeaderButtons from './components/HeaderButtons.vue';
import TableTextSearch from './components/TextSearch.vue';
import SearchOnTable from './Search';
import TableSearchRadio from './components/SearchRadio.vue';
import TableSearchDate from './components/SearchDate.vue';
import TableSearchArray from './components/SearchArray.vue';
import TableConfig from './components/Config.vue';

import { QTable } from 'quasar';

import { defineComponent, PropType, ref, onMounted } from 'vue';
import { ITableSchema, ISearchData, ITableAction } from './types';

export default defineComponent({
  name: 'TableSearch',
  components: {
    TableRoles,
    TableDate,
    TableStatus,
    TableActive,
    TableImages,
    TableMenu,
    TableHeaderButtons,
    TableTextSearch,
    TableSearchRadio,
    TableSearchDate,
    TableSearchArray,
    TableConfig,
  },
  emits: ['search', 'action'],
  props: {
    data: {
      type: Object as PropType<{ [key: string]: unknown }>,
      required: true,
    },
    schema: {
      type: Object as PropType<ITableSchema>,
      required: true,
    },
    dense: {
      type: Boolean as PropType<boolean>,
      required: false,
    },
  },
  setup(props, { emit }) {
    const filteredData = ref<{ [key: string]: unknown }[]>([]);
    const pagination = ref({ rowsPerPage: 50 });
    const loading = ref(true);
    const visibleColumns = ref<string[]>([]);
    const datatable = ref<QTable>();
    const ready = ref(false);
    const name = ref<string>(props.schema.name || 'table');
    let tableSearch: SearchOnTable;

    onMounted(() => {
      tableSearch = new SearchOnTable(Object.assign([], props.data), props.schema);
      if (props.schema) {
        pagination.value = { rowsPerPage: props.schema.rowsPerPage || 50 };
        props.schema.columns.map((column) => {
          if (!column.required) {
            visibleColumns.value.push(column.name);
          }
        });
      }

      filteredData.value = Object.assign([], props.data);
      ready.value = true;
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    });

    const doSearch = (search: ISearchData) => {
      filteredData.value = tableSearch.tableSearch(search);
    };

    const doSort = (col: string): void => {
      console.log(col);
      datatable.value?.sort(col);
    };

    const action = (action: ITableAction) => {
      if (action.action === 'selectColumn') {
        console.log(action.row);
        if (action.row.selected) {
          visibleColumns.value.push(action.row.label.toLowerCase());
        } else {
          for (var i = 0; i < visibleColumns.value.length; i++) {
            if (visibleColumns.value[i] === action.row.label.toLowerCase()) {
              visibleColumns.value.splice(i, 1);
              i--;
            }
          }
        }
        return;
      }
      emit('action', action);
    };

    return {
      doSearch,
      doSort,
      action,
      filteredData,
      pagination,
      visibleColumns,
      loading,
      ready,
      name,
    };
  },
});

/*

interface HTMLResizeElement extends Element {
  ro: ResizeObserver;
}

@Component({
  components: {
    TableRoles,
    TableDate,
    TableStatus,
    TableMenu,
    TableHeaderButtons,
    TableSearch,
    TableSearchRadio,
    TableSearchDate,
    TableSearchArray,
    TableConfig
  }
})
export default class DataTable extends Vue {
  @Prop({ required: true }) readonly data!: { [key: string]: unknown }[];
  @Prop({ required: true }) readonly schema!: ITableSchema;
  @Prop() readonly dense?: boolean;

  filteredData?: { [key: string]: unknown }[] = [];
  pagination = { rowsPerPage: this.schema.rowsPerPage || 50 };
  loading = true;

  @Watch('data')
  onDataChanged(val: { [key: string]: unknown }[]) {
    this.loading = true;
    this.filteredData = Object.assign([], val);
    this.tableSearch?.setData(Object.assign([], val));
    this.$nextTick(() => {
      this.loading = false;
    });
  }

  // searchItems!: ISearchValues;
  visibleColumns: string[] = [];
  tableSearch?: SearchOnTable;

  mounted() {
    this.tableSearch = new SearchOnTable(Object.assign([], this.data), this.schema);
    this.filteredData = Object.assign([], this.data);
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  doSearch(search: ISearchData) {
    this.filteredData = this.tableSearch?.tableSearch(search);
  }

  doSort(col: string): void {
    console.log(col);
    (this.$refs.datatable as QTable).sort(col);
  }

  action(action: ITableAction) {
    if (action.action === 'selectColumn') {
      console.log(action.row);
      if (action.row.selected) {
        this.visibleColumns.push(action.row.label.toLowerCase());
        console.log(this.visibleColumns);
      } else {
        for (var i = 0; i < this.visibleColumns.length; i++) {
          if (this.visibleColumns[i] === action.row.label.toLowerCase()) {
            this.visibleColumns.splice(i, 1);
            i--;
          }
        }
      }
      return;
    }
    this.$emit('action', action);
  }
}
*/
</script>
